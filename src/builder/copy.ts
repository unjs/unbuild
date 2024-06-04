import { promises as fsp } from "node:fs";
import { relative, resolve } from "pathe";
import { globby } from "globby";
import { symlink, rmdir, warn } from "../utils";
import type { CopyBuildEntry, BuildContext } from "../types";

const copy = fsp.cp || fsp.copyFile;

export async function copyBuild(ctx: BuildContext) {
  const entries = ctx.options.entries.filter(
    (e) => e.builder === "copy",
  ) as CopyBuildEntry[];
  await ctx.hooks.callHook("copy:entries", ctx, entries);
  for (const entry of entries) {
    const distDir = entry.outDir!;
    if (ctx.options.stub) {
      await rmdir(distDir);
      await symlink(entry.input, distDir);
    } else {
      const paths = await globby(entry.pattern || ["**"], {
        cwd: resolve(ctx.options.rootDir, entry.input),
        absolute: false,
      });

      const outputList = await Promise.allSettled(
        paths.map(async (path) => {
          const src = resolve(ctx.options.rootDir, entry.input, path);
          const dist = resolve(ctx.options.rootDir, distDir, path);
          await copy(src, dist);
          return dist;
        }),
      );

      for (const output of outputList) {
        if (output.status === "rejected") {
          warn(ctx, output.reason);
        }
      }

      ctx.buildEntries.push({
        path: distDir,
        chunks: outputList
          .filter(({ status }) => status === "fulfilled")
          .map((p) =>
            relative(
              ctx.options.outDir,
              (p as PromiseFulfilledResult<string>).value,
            ),
          ),
      });
    }
  }
  await ctx.hooks.callHook("copy:done", ctx);
}
