import { mkdist } from 'mkdist'
import { symlink, rmdir } from '../utils'
import type { BuildContext } from '../types'

export async function mkdistBuild (ctx: BuildContext) {
  for (const entry of ctx.options.entries.filter(e => e.builder === 'mkdist')) {
    const distDir = entry.outDir!
    if (ctx.options.stub) {
      await rmdir(distDir)
      await symlink(entry.input, distDir)
    } else {
      const { writtenFiles } = await mkdist({
        rootDir: ctx.options.rootDir,
        srcDir: entry.input,
        distDir,
        format: entry.format,
        cleanDist: false,
        declaration: entry.declaration,
        ext: entry.ext
      })
      ctx.buildEntries.push({
        path: distDir,
        chunks: [`${writtenFiles.length} files`]
      })
    }
  }
}
