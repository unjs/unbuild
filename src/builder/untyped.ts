import { writeFile } from 'fs/promises'
import { resolve } from 'pathe'
import { resolveSchema, generateTypes, generateMarkdown } from 'untyped'
// @ts-ignore
import untypedPlugin from 'untyped/babel-plugin'
import jiti from 'jiti'
import { pascalCase } from 'scule'
import type { BuildContext, UntypedBuildEntry, UntypedOutputs } from '../types'

export async function typesBuild (ctx: BuildContext) {
  const entries = ctx.options.entries.filter(entry => entry.builder === 'untyped') as UntypedBuildEntry[]
  await ctx.hooks.callHook('untyped:entries', ctx, entries)

  for (const entry of entries) {
    const options = {
      jiti: {
        esmResolve: true,
        interopDefault: true,
        transformOptions: {
          babel: {
            plugins: [
              untypedPlugin
            ]
          }
        }
      }
    }
    await ctx.hooks.callHook('untyped:entry:options', ctx, entry, options)

    const _require = jiti(ctx.options.rootDir, options.jiti)

    const distDir = entry.outDir!
    const srcConfig = _require(resolve(ctx.options.rootDir, entry.input))

    const defaults = entry.defaults || {}
    const schema = resolveSchema(srcConfig, defaults)

    await ctx.hooks.callHook('untyped:entry:schema', ctx, entry, schema)

    const outputs: UntypedOutputs = {
      markdown: {
        fileName: resolve(distDir, `${entry.name}.md`),
        contents: generateMarkdown(schema)
      },
      schema: {
        fileName: `${entry.name}.schema.json`,
        contents: JSON.stringify(schema, null, 2)
      },
      defaults: {
        fileName: `${entry.name}.defaults.json`,
        contents: JSON.stringify(defaults, null, 2)
      },
      declaration: entry.declaration
        ? {
            fileName: `${entry.name}.d.ts`,
            contents: generateTypes(schema, {
              interfaceName: pascalCase(entry.name + '-schema')
            })
          }
        : undefined
    }
    await ctx.hooks.callHook('untyped:entry:outputs', ctx, entry, outputs)
    for (const output of Object.values(outputs)) {
      await writeFile(resolve(distDir, output.fileName), output.contents, 'utf8')
    }
  }
  await ctx.hooks.callHook('untyped:done', ctx)
}
