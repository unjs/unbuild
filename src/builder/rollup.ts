import { writeFile, mkdir } from 'fs/promises'
import { promises as fsp } from 'fs'
import { pathToFileURL } from 'url'
import type { RollupOptions, OutputOptions, OutputChunk } from 'rollup'
import { rollup } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'
import _esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'
import replace from '@rollup/plugin-replace'
import { relative, resolve, dirname } from 'pathe'
import { resolvePath } from 'mlly'
import { getpkg, tryResolve, warn } from '../utils'
import type { BuildContext } from '../types'
import { JSONPlugin } from './plugins/json'
import { rawPlugin } from './plugins/raw'
import { cjsPlugin } from './plugins/cjs'
import { shebangPlugin, makeExecutable, getShebang } from './plugins/shebang'

// @ts-ignore https://github.com/unjs/unbuild/issues/23
const esbuild = _esbuild.default || _esbuild

export async function rollupBuild (ctx: BuildContext) {
  if (ctx.options.stub) {
    const jitiPath = await resolvePath('jiti', { url: import.meta.url })

    for (const entry of ctx.options.entries.filter(entry => entry.builder === 'rollup')) {
      const output = resolve(ctx.options.rootDir, ctx.options.outDir, entry.name!)

      const resolvedEntry = tryResolve(entry.input, ctx.options.rootDir) || entry.input
      const code = await fsp.readFile(resolvedEntry, 'utf8')
      const shebang = getShebang(code)

      await mkdir(dirname(output), { recursive: true })
      if (ctx.options.rollup.emitCJS) {
        await writeFile(output + '.cjs', `${shebang}module.exports = require(${JSON.stringify(jitiPath)})(null, { interopDefault: true })('${entry.input}')`)
      }
      // Use file:// protocol for windows compatibility
      await writeFile(output + '.mjs', `${shebang}import jiti from ${JSON.stringify(pathToFileURL(jitiPath).href)};\nexport default jiti(null, { interopDefault: true })('${entry.input}');`)
      await writeFile(output + '.d.ts', `export * from '${entry.input}';\nexport { default } from '${entry.input}';`)

      if (shebang) {
        await makeExecutable(output + '.cjs')
        await makeExecutable(output + '.mjs')
      }
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
          bytes: Buffer.byteLength(entry.code, 'utf8'),
          exports: entry.exports
        })
      }
    }
  }

  // Types
  if (ctx.options.declaration) {
    rollupOptions.plugins = rollupOptions.plugins || []
    // TODO: Use fresh rollup options
    const shebangPlugin: any = rollupOptions.plugins.find(p => p && p.name === 'unbuild-shebang')
    shebangPlugin._options.preserve = false
    rollupOptions.plugins.push(dts(ctx.options.rollup.dts))
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
  const extensions = ['.ts', '.tsx', '.mjs', '.cjs', '.js', '.jsx', '.json']

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
        warn(ctx, `Inlined implicit external ${id}`)
      }
      return isExplicitExternal
    },

    onwarn (warning, rollupWarn) {
      if (!warning.code || !['CIRCULAR_DEPENDENCY'].includes(warning.code)) {
        rollupWarn(warning)
      }
    },

    plugins: [
      ctx.options.rollup.replace && replace({
        ...ctx.options.rollup.replace,
        values: {
          ...ctx.options.replace,
          ...ctx.options.rollup.replace.values
        }
      }),

      ctx.options.rollup.alias && alias({
        ...ctx.options.rollup.alias,
        entries: {
          [ctx.pkg.name!]: ctx.options.rootDir,
          ...ctx.options.alias,
          ...ctx.options.rollup.alias.entries
        }
      }),

      ctx.options.rollup.resolve && nodeResolve({
        extensions,
        ...ctx.options.rollup.resolve
      }),

      ctx.options.rollup.json && JSONPlugin({
        ...ctx.options.rollup.json
      }),

      shebangPlugin(),

      ctx.options.rollup.esbuild && esbuild({
        ...ctx.options.rollup.esbuild
      }),

      ctx.options.rollup.commonjs && commonjs({
        extensions,
        ...ctx.options.rollup.commonjs
      }),

      // Preserve dynamic imports for CommonJS
      { renderDynamicImport () { return { left: 'import(', right: ')' } } },

      ctx.options.rollup.cjsBridge && cjsPlugin({}),

      rawPlugin()

    ].filter(Boolean)
  } as RollupOptions
}
