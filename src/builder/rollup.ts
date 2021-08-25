import { writeFile } from 'fs/promises'
import type { RollupOptions, OutputOptions, OutputChunk } from 'rollup'
import { rollup } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'
import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'
import { relative, resolve } from 'upath'
import consola from 'consola'
import { getpkg } from '../utils'
import type { BuildContext } from '../types'

export async function rollupBuild (ctx: BuildContext) {
  if (ctx.stub) {
    for (const entry of ctx.entries.filter(entry => entry.builder === 'rollup')) {
      const output = resolve(ctx.rootDir, ctx.outDir, entry.name)
      await writeFile(output + '.cjs', `module.exports = require('jiti')()('${entry.input}')`)
      await writeFile(output + '.mjs', `export * from '${entry.input}'`)
      await writeFile(output + '.d.ts', `export * from '${entry.input}'`)
    }
    return
  }

  const rollupOptions = getRollupOptions(ctx)
  if (!Object.keys(rollupOptions.input as any).length) {
    return
  }

  const buildResult = await rollup(rollupOptions)
  const allOutputOptions = rollupOptions.output! as OutputOptions[]
  for (const outputOptions of allOutputOptions) {
    const { output } = await buildResult.write(outputOptions)
    for (const entry of output.filter(e => e.type === 'chunk') as OutputChunk[]) {
      for (const id of entry.imports) {
        ctx.usedImports.add(id)
      }
      if (entry.isEntry) {
        ctx.buildEntries.push({
          path: relative(ctx.rootDir, resolve(outputOptions.dir, entry.fileName)),
          bytes: entry.code.length * 4,
          exports: entry.exports
        })
      }
    }
  }

  // Types
  if (ctx.declaration) {
    rollupOptions.plugins = rollupOptions.plugins || []
    rollupOptions.plugins.push(dts({
      respectExternal: true
    }))
    const typesBuild = await rollup(rollupOptions)
    await typesBuild.write({
      dir: resolve(ctx.rootDir, ctx.outDir),
      format: 'esm'
    })
  }
}

export function getRollupOptions (ctx: BuildContext): RollupOptions {
  const extensions = ['.ts', '.mjs', '.cjs', '.js', '.json']

  return {
    context: ctx.rootDir,

    input: Object.fromEntries(ctx.entries
      .filter(entry => entry.builder === 'rollup')
      .map(entry => [entry.name, resolve(ctx.rootDir, entry.input)])
    ),

    output: [
      {
        dir: resolve(ctx.rootDir, ctx.outDir),
        entryFileNames: '[name].cjs',
        chunkFileNames: 'chunks/[name].cjs',
        format: 'cjs',
        exports: 'auto',
        preferConst: true,
        externalLiveBindings: false,
        freeze: false
      },
      {
        dir: resolve(ctx.rootDir, ctx.outDir),
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunks/[name].mjs',
        format: 'esm',
        exports: 'auto',
        preferConst: true,
        externalLiveBindings: false,
        freeze: false
      }
    ],

    external (id) {
      const pkg = getpkg(id)
      const isExplicitExternal = ctx.externals.includes(pkg)
      if (isExplicitExternal) {
        return true
      }
      if (ctx.inlineDependencies || id[0] === '.' || id[0] === '/' || id.match(/src[\\/]/) || id.startsWith(ctx.pkg.name)) {
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
        [ctx.pkg.name]: ctx.rootDir
      }),

      nodeResolve({
        extensions,
        preferBuiltins: true
      }),

      {
        name: 'json',
        transform (json, id) {
          if (!id || id[0] === '\0' || !id.endsWith('.json')) { return null }
          return {
            code: 'module.exports = ' + json,
            map: null
          }
        }
      },

      esbuild({
        target: 'es2019'
      }),

      commonjs({
        extensions,
        ignore: [
          ...ctx.externals
        ]
      })
    ]
  }
}
