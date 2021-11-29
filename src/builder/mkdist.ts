import { mkdist, MkdistOptions } from 'mkdist'
import { symlink, rmdir } from '../utils'
import type { BuildEntry, BuildContext } from '../types'
export async function mkdistBuild (ctx: BuildContext) {
  type MkdistEntry = BuildEntry & { builder: 'mkdist' }
  const entries = ctx.options.entries.filter(e => e.builder === 'mkdist') as MkdistEntry[]
  await ctx.hooks.callHook('mkdist:before', ctx, entries)
  for (const entry of entries) {
    const distDir = entry.outDir!
    if (ctx.options.stub) {
      await rmdir(distDir)
      await symlink(entry.input, distDir)
    } else {
      const mkdistOptions: MkdistOptions = {
        rootDir: ctx.options.rootDir,
        srcDir: entry.input,
        distDir,
        format: entry.format,
        cleanDist: false,
        declaration: entry.declaration,
        // @ts-ignore
        ext: entry.ext
      }
      await ctx.hooks.callHook('mkdist:options', ctx, mkdistOptions)
      const output = await mkdist(mkdistOptions)
      ctx.buildEntries.push({
        path: distDir,
        chunks: [`${output.writtenFiles.length} files`]
      })
      await ctx.hooks.callHook('mkdist:build', ctx, output)
    }
  }
  await ctx.hooks.callHook('mkdist:done', ctx)
}
