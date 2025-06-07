import type { OutputOptions, OutputChunk } from "rollup";
import { rollup } from "rollup";
import dts from "rollup-plugin-dts";
import { resolve } from "pathe";
import type { BuildContext } from "../../types";
import { removeShebangPlugin } from "./plugins/shebang";
import consola from "consola";
import { getRollupOptions } from "./config";
import { getChunkFilename } from "./utils";
import { rollupStub } from "./stub";
import { rollupWatch } from "./watch";
import { fixCJSExportTypePlugin } from "./plugins/cjs";

export async function rollupBuild(ctx: BuildContext): Promise<void> {
  // Stub mode
  if (ctx.options.stub) {
    await rollupStub(ctx);
    await ctx.hooks.callHook("rollup:done", ctx);
    return;
  }

  // Resolve options
  const rollupOptions = getRollupOptions(ctx);
  await ctx.hooks.callHook("rollup:options", ctx, rollupOptions);

  // Skip build if no input entries defined
  if (Object.keys(rollupOptions.input as any).length === 0) {
    await ctx.hooks.callHook("rollup:done", ctx);
    return;
  }

  // Do rollup build
  const buildResult = await rollup(rollupOptions);
  await ctx.hooks.callHook("rollup:build", ctx, buildResult);

  // Collect info about output entries
  const allOutputOptions = rollupOptions.output! as OutputOptions[];
  for (const outputOptions of allOutputOptions) {
    const { output } = await buildResult.write(outputOptions);
    const entryChunks = output.filter(
      (chunk) => chunk.type === "chunk" && chunk.isEntry,
    ) as OutputChunk[];

    for (const chunk of entryChunks) {
      ctx.buildEntries.push({
        chunks: chunk.imports.filter((i) =>
          entryChunks.find((c) => c.fileName === i),
        ),
        modules: Object.entries(chunk.modules).map(([id, mod]) => ({
          id,
          bytes: mod.renderedLength,
        })),
        path: chunk.fileName,
        bytes: Buffer.byteLength(chunk.code, "utf8"),
        exports: chunk.exports,
      });
    }
  }

  // Watch
  if (ctx.options.watch) {
    rollupWatch(rollupOptions);
    // TODO: Clone rollup options to continue types watching
    if (ctx.options.declaration && ctx.options.watch) {
      consola.warn("`rollup` DTS builder does not support watch mode yet.");
    }
    return;
  }

  // Types
  if (ctx.options.declaration) {
    rollupOptions.plugins = [
      ...rollupOptions.plugins,
      dts(ctx.options.rollup.dts),
      removeShebangPlugin(),
      ctx.options.rollup.emitCJS && fixCJSExportTypePlugin(ctx),
    ].filter(
      (plugin): plugin is NonNullable<Exclude<typeof plugin, false>> =>
        /**
         * Issue: #396
         * rollup-plugin-dts conflicts with rollup-plugin-commonjs:
         * https://github.com/Swatinem/rollup-plugin-dts?tab=readme-ov-file#what-to-expect
         */
        !!plugin && (!("name" in plugin) || plugin.name !== "commonjs"),
    );

    await ctx.hooks.callHook("rollup:dts:options", ctx, rollupOptions);
    const typesBuild = await rollup(rollupOptions);
    await ctx.hooks.callHook("rollup:dts:build", ctx, typesBuild);
    // #region cjs
    if (ctx.options.rollup.emitCJS) {
      await typesBuild.write({
        dir: resolve(ctx.options.rootDir, ctx.options.outDir),
        entryFileNames: "[name].d.cts",
        chunkFileNames: (chunk) => getChunkFilename(ctx, chunk, "d.cts"),
      });
    }
    // #endregion
    // #region mjs
    await typesBuild.write({
      dir: resolve(ctx.options.rootDir, ctx.options.outDir),
      entryFileNames: "[name].d.mts",
      chunkFileNames: (chunk) => getChunkFilename(ctx, chunk, "d.mts"),
    });
    // #endregion
    // #region .d.ts for node10 compatibility (TypeScript version < 4.7)
    if (
      ctx.options.declaration === true ||
      ctx.options.declaration === "compatible"
    ) {
      await typesBuild.write({
        dir: resolve(ctx.options.rootDir, ctx.options.outDir),
        entryFileNames: "[name].d.ts",
        chunkFileNames: (chunk) => getChunkFilename(ctx, chunk, "d.ts"),
      });
    }
    // #endregion
  }

  await ctx.hooks.callHook("rollup:done", ctx);
}
