import { writeFile, mkdir } from "node:fs/promises";
import { promises as fsp } from "node:fs";
import { pathToFileURL } from "node:url";
import type {
  RollupOptions,
  OutputOptions,
  OutputChunk,
  PreRenderedChunk,
} from "rollup";
import { rollup } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import dts from "rollup-plugin-dts";
import replace from "@rollup/plugin-replace";
import { resolve, dirname, normalize, extname, isAbsolute } from "pathe";
import { resolvePath, resolveModuleExportNames } from "mlly";
import { arrayIncludes, getpkg, tryResolve, warn } from "../utils";
import type { BuildContext } from "../types";
import { esbuild } from "./plugins/esbuild";
import { JSONPlugin } from "./plugins/json";
import { rawPlugin } from "./plugins/raw";
import { cjsPlugin } from "./plugins/cjs";
import {
  shebangPlugin,
  makeExecutable,
  getShebang,
  removeShebangPlugin,
} from "./plugins/shebang";

const DEFAULT_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".js",
  ".jsx",
  ".json",
];

export async function rollupBuild(ctx: BuildContext) {
  if (ctx.options.stub) {
    const jitiPath = await resolvePath("jiti", { url: import.meta.url });
    const serializedJitiOptions = JSON.stringify(
      {
        ...ctx.options.stubOptions.jiti,
        alias: {
          ...resolveAliases(ctx),
          ...ctx.options.stubOptions.jiti.alias,
        },
      },
      null,
      2,
    );

    for (const entry of ctx.options.entries.filter(
      (entry) => entry.builder === "rollup",
    )) {
      const output = resolve(
        ctx.options.rootDir,
        ctx.options.outDir,
        entry.name!,
      );

      const resolvedEntry = normalize(
        tryResolve(entry.input, ctx.options.rootDir) || entry.input,
      );
      const resolvedEntryWithoutExt = resolvedEntry.slice(
        0,
        Math.max(0, resolvedEntry.length - extname(resolvedEntry).length),
      );
      const code = await fsp.readFile(resolvedEntry, "utf8");
      const shebang = getShebang(code);

      await mkdir(dirname(output), { recursive: true });

      // CJS Stub
      if (ctx.options.rollup.emitCJS) {
        await writeFile(
          output + ".cjs",
          shebang +
            [
              `const jiti = require(${JSON.stringify(jitiPath)})`,
              "",
              `const _jiti = jiti(null, ${serializedJitiOptions})`,
              "",
              `/** @type {import(${JSON.stringify(
                resolvedEntryWithoutExt,
              )})} */`,
              `module.exports = _jiti(${JSON.stringify(resolvedEntry)})`,
            ].join("\n"),
        );
      }

      // MJS Stub
      // Try to analyze exports
      const namedExports: string[] = await resolveModuleExportNames(
        resolvedEntry,
        {
          extensions: DEFAULT_EXTENSIONS,
        },
      ).catch((error) => {
        warn(ctx, `Cannot analyze ${resolvedEntry} for exports:` + error);
        return [];
      });
      const hasDefaultExport =
        namedExports.includes("default") || namedExports.length === 0;

      await writeFile(
        output + ".mjs",
        shebang +
          [
            `import jiti from ${JSON.stringify(pathToFileURL(jitiPath).href)};`,
            "",
            `const _jiti = jiti(null, ${serializedJitiOptions})`,
            "",
            `/** @type {import(${JSON.stringify(resolvedEntryWithoutExt)})} */`,
            `const _module = await _jiti.import(${JSON.stringify(
              resolvedEntry,
            )});`,
            hasDefaultExport ? "\nexport default _module;" : "",
            ...namedExports
              .filter((name) => name !== "default")
              .map((name) => `export const ${name} = _module.${name};`),
          ].join("\n"),
      );

      // DTS Stub
      await writeFile(
        output + ".d.ts",
        [
          `export * from ${JSON.stringify(resolvedEntryWithoutExt)};`,
          hasDefaultExport
            ? `export { default } from ${JSON.stringify(
                resolvedEntryWithoutExt,
              )};`
            : "",
        ].join("\n"),
      );

      if (shebang) {
        await makeExecutable(output + ".cjs");
        await makeExecutable(output + ".mjs");
      }
    }
    await ctx.hooks.callHook("rollup:done", ctx);
    return;
  }

  const rollupOptions = getRollupOptions(ctx);
  await ctx.hooks.callHook("rollup:options", ctx, rollupOptions);

  if (Object.keys(rollupOptions.input as any).length === 0) {
    return;
  }

  const buildResult = await rollup(rollupOptions);
  await ctx.hooks.callHook("rollup:build", ctx, buildResult);

  const allOutputOptions = rollupOptions.output! as OutputOptions[];
  for (const outputOptions of allOutputOptions) {
    const { output } = await buildResult.write(outputOptions);
    const chunkFileNames = new Set<string>();
    const outputChunks = output.filter(
      (e) => e.type === "chunk",
    ) as OutputChunk[];
    for (const entry of outputChunks) {
      chunkFileNames.add(entry.fileName);
      for (const id of entry.imports) {
        ctx.usedImports.add(id);
      }
      if (entry.isEntry) {
        ctx.buildEntries.push({
          chunks: entry.imports.filter((i) =>
            outputChunks.find((c) => c.fileName === i),
          ),
          modules: Object.entries(entry.modules).map(([id, mod]) => ({
            id,
            bytes: mod.renderedLength,
          })),
          path: entry.fileName,
          bytes: Buffer.byteLength(entry.code, "utf8"),
          exports: entry.exports,
        });
      }
    }
    for (const chunkFileName of chunkFileNames) {
      ctx.usedImports.delete(chunkFileName);
    }
  }

  // Types
  if (ctx.options.declaration) {
    rollupOptions.plugins = [
      rollupOptions.plugins,
      dts(ctx.options.rollup.dts),
      removeShebangPlugin(),
    ];

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

const getChunkFilename = (
  ctx: BuildContext,
  chunk: PreRenderedChunk,
  ext: string,
) => {
  if (chunk.isDynamicEntry) {
    return `chunks/[name].${ext}`;
  }
  // TODO: Find a way to generate human friendly hash for short groups
  return `shared/${ctx.options.name}.[hash].${ext}`;
};

export function getRollupOptions(ctx: BuildContext): RollupOptions {
  return (<RollupOptions>{
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
        <OutputOptions>{
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
        },
      <OutputOptions>{
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
      },
    ].filter(Boolean),

    external(id) {
      const pkg = getpkg(id);
      const isExplicitExternal =
        arrayIncludes(ctx.options.externals, pkg) ||
        arrayIncludes(ctx.options.externals, id);
      if (isExplicitExternal) {
        return true;
      }
      if (
        ctx.options.rollup.inlineDependencies ||
        id[0] === "." ||
        isAbsolute(id) ||
        /src[/\\]/.test(id) ||
        id.startsWith(ctx.pkg.name!)
      ) {
        return false;
      }
      if (!isExplicitExternal) {
        warn(ctx, `Inlined implicit external ${id}`);
      }
      return isExplicitExternal;
    },

    onwarn(warning, rollupWarn) {
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
          entries: resolveAliases(ctx),
        }),

      ctx.options.rollup.resolve &&
        nodeResolve({
          extensions: DEFAULT_EXTENSIONS,
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
        renderDynamicImport() {
          return { left: "import(", right: ")" };
        },
      },

      ctx.options.rollup.cjsBridge && cjsPlugin({}),

      rawPlugin(),
    ].filter(Boolean),
  }) as RollupOptions;
}

function resolveAliases(ctx: BuildContext) {
  const aliases: Record<string, string> = {
    [ctx.pkg.name!]: ctx.options.rootDir,
    ...ctx.options.alias,
  };

  if (ctx.options.rollup.alias) {
    if (Array.isArray(ctx.options.rollup.alias.entries)) {
      Object.assign(
        aliases,
        Object.fromEntries(
          ctx.options.rollup.alias.entries.map((entry) => {
            return [entry.find, entry.replacement];
          }),
        ),
      );
    } else {
      Object.assign(
        aliases,
        ctx.options.rollup.alias.entries || ctx.options.rollup.alias,
      );
    }
  }

  return aliases;
}
