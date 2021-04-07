import { unlink, symlink } from 'fs/promises'
import { mkdist } from 'mkdist'
import { resolve, join } from 'upath'
import type { BuildContext } from '../types'

export async function mkdistBuild (ctx: BuildContext) {
  for (const entry of ctx.entries.filter(e => e.builder === 'mkdist')) {
    if (ctx.stub) {
      const srcDir = resolve(ctx.rootDir, entry.input)
      const outDir = resolve(ctx.rootDir, ctx.outDir, entry.name)
      await unlink(outDir).catch(() => { })
      await symlink(srcDir, outDir)
    } else {
      const { writtenFiles } = await mkdist({
        rootDir: ctx.rootDir,
        srcDir: entry.input,
        distDir: join(ctx.outDir, entry.name),
        format: entry.format,
        cleanDist: false
      })
      ctx.buildEntries.push({
        path: join(ctx.outDir, entry.name),
        chunks: [`${writtenFiles.length} files`]
      })
    }
  }
}
