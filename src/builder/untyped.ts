import { writeFile } from 'fs/promises'
import { resolve } from 'pathe'
import { resolveSchema, generateTypes, generateMarkdown } from 'untyped'
// @ts-ignore
import untypedPlugin from 'untyped/loader/babel'
import jiti from 'jiti'
import { pascalCase } from 'scule'
import type { BuildContext } from '../types'

export async function typesBuild (ctx: BuildContext) {
  for (const entry of ctx.options.entries.filter(entry => entry.builder === 'untyped')) {
    const _require = jiti(ctx.options.rootDir, {
      interopDefault: true,
      transformOptions: {
        babel: {
          plugins: [
            untypedPlugin
          ]
        }
      }
    })

    const distDir = entry.outDir!
    const srcConfig = _require(resolve(ctx.options.rootDir, entry.input))

    const defaults = entry.defaults || {}
    const schema = resolveSchema(srcConfig, defaults)

    await writeFile(resolve(distDir, `${entry.name}.md`), generateMarkdown(schema))
    await writeFile(resolve(distDir, `${entry.name}.schema.json`), JSON.stringify(schema, null, 2))
    await writeFile(resolve(distDir, `${entry.name}.defaults.json`), JSON.stringify(defaults, null, 2))
    if (entry.declaration) {
      await writeFile(resolve(distDir, `${entry.name}.d.ts`), generateTypes(schema, pascalCase(entry.name + '-schema')))
    }
  }
}
