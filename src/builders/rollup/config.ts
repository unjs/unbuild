import type { OutputOptions, PreRenderedChunk } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import replace from "@rollup/plugin-replace";
import { resolve, isAbsolute } from "pathe";
import { resolveAlias } from "pathe/utils";
import { parseNodeModulePath } from "mlly";
import { arrayIncludes, getpkg, warn } from "../../utils";
import type { BuildContext, RollupOptions } from "../../types";
import { esbuild } from "./plugins/esbuild";
import { JSONPlugin } from "./plugins/json";
import { rawPlugin } from "./plugins/raw";
import { cjsPlugin } from "./plugins/cjs";
import { shebangPlugin } from "./plugins/shebang";
import { DEFAULT_EXTENSIONS, getChunkFilename, resolveAliases } from "./utils";

export function getRollupOptions(ctx: BuildContext): RollupOptions {
  const _aliases = resolveAliases(ctx);
  return {
    input: Object.fromEntries(
      ctx.options.entries
        .filter((entry) => entry.builder === "rollup")
        .map((entry) => [
          entry.name,
          resolve(ctx.options.rootDir, entry.input),
        ]),
    ),

    output: [
      ctx.options.rollup.emitCJS &&
        ({
          dir: resolve(ctx.options.rootDir, ctx.options.outDir),
          entryFileNames: "[name].cjs",
          chunkFileNames: (chunk: PreRenderedChunk) =>
            getChunkFilename(ctx, chunk, "cjs"),
          format: "cjs",
          exports: "auto",
          interop: "compat",
          generatedCode: { constBindings: true },
          externalLiveBindings: false,
          freeze: false,
          sourcemap: ctx.options.sourcemap,
          ...ctx.options.rollup.output,
        } satisfies OutputOptions),
      {
        dir: resolve(ctx.options.rootDir, ctx.options.outDir),
        entryFileNames: "[name].mjs",
        chunkFileNames: (chunk: PreRenderedChunk) =>
          getChunkFilename(ctx, chunk, "mjs"),
        format: "esm",
        exports: "auto",
        generatedCode: { constBindings: true },
        externalLiveBindings: false,
        freeze: false,
        sourcemap: ctx.options.sourcemap,
        ...ctx.options.rollup.output,
      } satisfies OutputOptions,
    ].filter(Boolean) as OutputOptions[],

    external(originalId): boolean {
      // Resolve aliases
      const resolvedId = resolveAlias(originalId, _aliases);

      // Try to guess package name of id
      const pkgName =
        parseNodeModulePath(resolvedId)?.name ||
        parseNodeModulePath(originalId)?.name ||
        getpkg(originalId);

      // Check for explicit external rules
      if (
        arrayIncludes(ctx.options.externals, pkgName) ||
        arrayIncludes(ctx.options.externals, originalId) ||
        arrayIncludes(ctx.options.externals, resolvedId)
      ) {
        return true;
      }

      // Source is always bundled
      for (const id of [originalId, resolvedId]) {
        if (
          id[0] === "." ||
          isAbsolute(id) ||
          /src[/\\]/.test(id) ||
          id.startsWith(ctx.pkg.name!)
        ) {
          return false;
        }
      }

      // Check for other explicit inline rules
      if (
        ctx.options.rollup.inlineDependencies === true ||
        (Array.isArray(ctx.options.rollup.inlineDependencies) &&
          (arrayIncludes(ctx.options.rollup.inlineDependencies, pkgName) ||
            arrayIncludes(ctx.options.rollup.inlineDependencies, originalId) ||
            arrayIncludes(ctx.options.rollup.inlineDependencies, resolvedId)))
      ) {
        return false;
      }

      // Inline by default, but also show a warning, since it is an implicit behavior
      warn(ctx, `Implicitly bundling "${originalId}"`);
      return false;
    },

    onwarn(warning, rollupWarn): void {
      if (!warning.code || !["CIRCULAR_DEPENDENCY"].includes(warning.code)) {
        rollupWarn(warning);
      }
    },

    plugins: [
      ctx.options.rollup.replace &&
        replace({
          ...ctx.options.rollup.replace,
          values: {
            ...ctx.options.replace,
            ...ctx.options.rollup.replace.values,
          },
        }),

      ctx.options.rollup.alias &&
        alias({
          ...ctx.options.rollup.alias,
          entries: _aliases,
        }),

      ctx.options.rollup.resolve &&
        nodeResolve({
          extensions: DEFAULT_EXTENSIONS,
          exportConditions: ["production"],
          ...ctx.options.rollup.resolve,
        }),

      ctx.options.rollup.json &&
        JSONPlugin({
          ...ctx.options.rollup.json,
        }),

      shebangPlugin(),

      ctx.options.rollup.esbuild &&
        esbuild({
          sourcemap: ctx.options.sourcemap,
          ...ctx.options.rollup.esbuild,
        }),

      ctx.options.rollup.commonjs &&
        commonjs({
          extensions: DEFAULT_EXTENSIONS,
          ...ctx.options.rollup.commonjs,
        }),

      ctx.options.rollup.preserveDynamicImports && {
        name: "unbuild=preserve-dynamic-imports",
        renderDynamicImport(): { left: string; right: string } {
          return { left: "import(", right: ")" };
        },
      },

      ctx.options.rollup.cjsBridge && cjsPlugin({}),

      rawPlugin(),
    ].filter((p): p is NonNullable<Exclude<typeof p, false>> => !!p),
  } satisfies RollupOptions;
}
