import { writeFile, mkdir } from 'fs/promises'
import { resolve, dirname } from 'upath'
import { resolveSchema, generateTypes, generateMarkdown } from 'untyped'
import untypedPlugin from 'untyped/dist/loader/babel'
import jiti from 'jiti'
import { pascalCase } from 'scule'
import type { BuildContext } from '../types'

export async function typesBuild (ctx: BuildContext) {
  for (const entry of ctx.entries.filter(entry => entry.builder === 'untyped')) {
    const _require = jiti(ctx.rootDir, {
      interopDefault: true,
      transformOptions: {
        babel: {
          plugins: [
            untypedPlugin
          ]
        }
      }
    })

    const srcConfig = _require(resolve(ctx.rootDir, entry.input))
    const genDir = resolve(ctx.rootDir, ctx.genDir, entry.name)

    const defaults = entry.defaults || {}
    const schema = resolveSchema(srcConfig, defaults)

    await mkdir(dirname(genDir)).catch(() => { })
    await mkdir(genDir).catch(() => { })
    await writeFile(resolve(genDir, `${entry.name}.md`), generateMarkdown(schema))
    await writeFile(resolve(genDir, `${entry.name}.schema.json`), JSON.stringify(schema, null, 2))
    await writeFile(resolve(genDir, `${entry.name}.defaults.json`), JSON.stringify(defaults, null, 2))
    await writeFile(resolve(genDir, `${entry.name}.d.ts`), 'export ' + generateTypes(schema, pascalCase(entry.name + '-schema')))
  }
}
