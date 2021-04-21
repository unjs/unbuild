import { mkdist } from 'mkdist'
import { join } from 'upath'
import { symlink } from '../utils'
import type { BuildContext } from '../types'

export async function mkdistBuild (ctx: BuildContext) {
  for (const entry of ctx.entries.filter(e => e.builder === 'mkdist')) {
    const distDir = join(entry.outDir, entry.name)
    if (ctx.stub) {
      await symlink(entry.input, distDir)
    } else {
      const { writtenFiles } = await mkdist({
        rootDir: ctx.rootDir,
        srcDir: entry.input,
        distDir,
        format: entry.format,
        cleanDist: false,
        declaration: entry.declaration
      })
      ctx.buildEntries.push({
        path: distDir,
        chunks: [`${writtenFiles.length} files`]
      })
    }
  }
}
