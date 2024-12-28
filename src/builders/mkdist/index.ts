import { relative } from "pathe";
import { mkdist, type MkdistOptions } from "mkdist";
import { symlink, rmdir, warn } from "../../utils";
import type { MkdistBuildEntry, BuildContext } from "../../types";
import consola from "consola";

export async function mkdistBuild(ctx: BuildContext): Promise<void> {
  const entries = ctx.options.entries.filter(
    (e) => e.builder === "mkdist",
  ) as MkdistBuildEntry[];
  await ctx.hooks.callHook("mkdist:entries", ctx, entries);
  for (const entry of entries) {
    const distDir = entry.outDir!;
    if (ctx.options.stub) {
      await rmdir(distDir);
      await symlink(entry.input, distDir);
    } else {
      const mkdistOptions: MkdistOptions = {
        rootDir: ctx.options.rootDir,
        srcDir: entry.input,
        distDir,
        cleanDist: false,
        ...entry,
      };
      await ctx.hooks.callHook(
        "mkdist:entry:options",
        ctx,
        entry,
        mkdistOptions,
      );
      const output = await mkdist(mkdistOptions);
      ctx.buildEntries.push({
        path: distDir,
        chunks: output.writtenFiles.map((p) => relative(ctx.options.outDir, p)),
      });
      await ctx.hooks.callHook("mkdist:entry:build", ctx, entry, output);
      if (output.errors) {
        for (const error of output.errors) {
          warn(
            ctx,
            `mkdist build failed for \`${relative(ctx.options.rootDir, error.filename)}\`:\n${error.errors.map((e) => `  - ${e}`).join("\n")}`,
          );
        }
      }
    }
  }
  await ctx.hooks.callHook("mkdist:done", ctx);

  if (entries.length > 0 && ctx.options.watch) {
    consola.warn("`mkdist` builder does not support watch mode yet.");
  }
}
