import { writeFile } from 'fs/promises'
import type { RollupOptions, OutputOptions, OutputChunk } from 'rollup'
import { rollup } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'
import _esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'
import { relative, resolve } from 'pathe'
import consola from 'consola'
import { getpkg } from '../utils'
import type { BuildContext } from '../types'
import { JSONPlugin } from './plugins/json'
import { rawPlugin } from './plugins/raw'
import { cjsPlugin } from './plugins/cjs'

// @ts-ignore https://github.com/unjs/unbuild/issues/23
const esbuild = _esbuild.default || _esbuild

export async function rollupBuild (ctx: BuildContext) {
  if (ctx.options.stub) {
    for (const entry of ctx.options.entries.filter(entry => entry.builder === 'rollup')) {
      const output = resolve(ctx.options.rootDir, ctx.options.outDir, entry.name!)
      if (ctx.options.rollup.emitCJS) {
        await writeFile(output + '.cjs', `module.exports = require('jiti')(null, { interopDefault: true })('${entry.input}')`)
      }
      await writeFile(output + '.mjs', `import jiti from 'jiti';\nexport default jiti(null, { interopDefault: true })('${entry.input}');`)
      await writeFile(output + '.d.ts', `export * from '${entry.input}';\nexport { default } from '${entry.input}';`)
    }
    await ctx.hooks.callHook('rollup:done', ctx)
    return
  }

  const rollupOptions = getRollupOptions(ctx)
  await ctx.hooks.callHook('rollup:options', ctx, rollupOptions)

  if (!Object.keys(rollupOptions.input as any).length) {
    return
  }

  const buildResult = await rollup(rollupOptions)
  await ctx.hooks.callHook('rollup:build', ctx, buildResult)

  const allOutputOptions = rollupOptions.output! as OutputOptions[]
  for (const outputOptions of allOutputOptions) {
    const { output } = await buildResult.write(outputOptions)
    for (const entry of output.filter(e => e.type === 'chunk') as OutputChunk[]) {
      for (const id of entry.imports) {
        ctx.usedImports.add(id)
      }
      if (entry.isEntry) {
        ctx.buildEntries.push({
          path: relative(ctx.options.rootDir, resolve(outputOptions.dir!, entry.fileName)),
          bytes: entry.code.length * 4,
          exports: entry.exports
        })
      }
    }
  }

  // Types
  if (ctx.options.declaration) {
    rollupOptions.plugins = rollupOptions.plugins || []
    rollupOptions.plugins.push(dts({ respectExternal: true }))
    await ctx.hooks.callHook('rollup:dts:options', ctx, rollupOptions)
    const typesBuild = await rollup(rollupOptions)
    await ctx.hooks.callHook('rollup:dts:build', ctx, typesBuild)
    await typesBuild.write({
      dir: resolve(ctx.options.rootDir, ctx.options.outDir),
      format: 'esm'
    })
  }

  await ctx.hooks.callHook('rollup:done', ctx)
}

export function getRollupOptions (ctx: BuildContext): RollupOptions {
  const extensions = ['.ts', '.mjs', '.cjs', '.js', '.json']

  return {
    context: ctx.options.rootDir,

    input: Object.fromEntries(ctx.options.entries
      .filter(entry => entry.builder === 'rollup')
      .map(entry => [entry.name, resolve(ctx.options.rootDir, entry.input)])
    ),

    output: [
      ctx.options.rollup.emitCJS && {
        dir: resolve(ctx.options.rootDir, ctx.options.outDir),
        entryFileNames: '[name].cjs',
        chunkFileNames: 'chunks/[name].cjs',
        format: 'cjs',
        exports: 'auto',
        preferConst: true,
        externalLiveBindings: false,
        freeze: false
      },
      {
        dir: resolve(ctx.options.rootDir, ctx.options.outDir),
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunks/[name].mjs',
        format: 'esm',
        exports: 'auto',
        preferConst: true,
        externalLiveBindings: false,
        freeze: false
      }
    ].filter(Boolean),

    external (id) {
      const pkg = getpkg(id)
      const isExplicitExternal = ctx.options.externals.includes(pkg)
      if (isExplicitExternal) {
        return true
      }
      if (ctx.options.rollup.inlineDependencies || id[0] === '.' || id[0] === '/' || id.match(/src[\\/]/) || id.startsWith(ctx.pkg.name!)) {
        return false
      }
      if (!isExplicitExternal) {
        consola.warn(`Inlining implicit external ${id}`)
      }
      return isExplicitExternal
    },

    onwarn (warning, rollupWarn) {
      if (!warning.code || !['CIRCULAR_DEPENDENCY'].includes(warning.code)) {
        rollupWarn(warning)
      }
    },

    plugins: [
      alias({
        [ctx.pkg.name!]: ctx.options.rootDir
      }),

      nodeResolve({
        extensions,
        preferBuiltins: true
      }),

      JSONPlugin({
        preferConst: true
      }),

      esbuild({
        target: 'es2020'
      }),

      commonjs({
        extensions,
        ignoreTryCatch: true
      }),

      // Preserve dynamic imports for CommonJS
      { renderDynamicImport () { return { left: 'import(', right: ')' } } },

      ctx.options.rollup.cjsBridge && cjsPlugin({}),

      rawPlugin()
    ].filter(Boolean)
  } as RollupOptions
}
