import { writeFile } from 'fs/promises'
import { RollupOptions, OutputOptions, OutputChunk, rollup } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'
import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'
import { relative, resolve } from 'upath'
import consola from 'consola'
import type { BuildContext } from '../types'

export async function rollupBuild (ctx: BuildContext) {
  if (ctx.stub) {
    for (const entry of ctx.entries.filter(entry => entry.builder === 'rollup')) {
      const input = resolve(ctx.rootDir, entry.input)
      const output = resolve(ctx.rootDir, ctx.outDir, entry.name)
      await writeFile(output + '.js', `module.exports = require('jiti')()('${input}')`)
      await writeFile(output + '.mjs', `export * from '${input}'`)
      await writeFile(output + '.d.ts', `export * from '${input}'`)
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
  rollupOptions.plugins = rollupOptions.plugins || []
  rollupOptions.plugins.push(dts())
  const typesBuild = await rollup(rollupOptions)
  await typesBuild.write({
    dir: resolve(ctx.rootDir, ctx.outDir),
    format: 'esm'
  })
}

export function getRollupOptions (ctx: BuildContext): RollupOptions {
  const extensions = ['.ts', '.mjs', '.js', '.json']

  return {
    context: ctx.rootDir,
    input: Object.fromEntries(ctx.entries
      .filter(entry => entry.builder === 'rollup')
      .map(entry => [entry.name, resolve(ctx.rootDir, entry.input)])
    ),

    output: [
      {
        dir: resolve(ctx.rootDir, ctx.outDir),
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        format: 'cjs',
        exports: 'auto',
        preferConst: true
      },
      {
        dir: resolve(ctx.rootDir, ctx.outDir),
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunks/[name].mjs',
        format: 'esm',
        exports: 'auto',
        preferConst: true
      }
    ],

    external (id) {
      if (id[0] === '.' || id[0] === '/' || id.includes('src/')) {
        return false
      }
      const isExplicitExternal = !!ctx.externals.find(ext => id.includes(ext))
      if (!isExplicitExternal) {
        consola.warn(`Inlining external ${id}`)
      }
      return isExplicitExternal
    },

    onwarn (warning, rollupWarn) {
      if (!warning.code || !['CIRCULAR_DEPENDENCY'].includes(warning.code)) {
        rollupWarn(warning)
      }
    },

    plugins: [
      // TODO
      alias({}),

      nodeResolve({
        extensions
      }),

      esbuild({
        target: 'node12',
        loaders: {
          '.json': 'json'
        }
      }),

      commonjs({
        extensions
      })
    ]
  }
}
