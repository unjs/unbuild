import { writeFile, mkdir } from "node:fs/promises";
import { promises as fsp } from "node:fs";
import type { OutputOptions, OutputChunk, PreRenderedChunk } from "rollup";
import { rollup } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import dts from "rollup-plugin-dts";
import replace from "@rollup/plugin-replace";
import {
  resolve,
  dirname,
  normalize,
  extname,
  isAbsolute,
  relative,
} from "pathe";
import { resolvePath, pathToFileURL, resolveModuleExportNames } from "mlly";
import { watch as rollupWatch } from "rollup";
import { arrayIncludes, getpkg, warn } from "../utils";
import type { BuildContext, RollupOptions } from "../types";
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
import consola from "consola";
import chalk from "chalk";

const DEFAULT_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".mjs",
  ".cjs",
  ".js",
  ".jsx",
  ".json",
];

export async function rollupBuild(ctx: BuildContext) {
  if (ctx.options.stub) {
    const babelPlugins = ctx.options.stubOptions.jiti.transformOptions?.babel
      ?.plugins as any;
    const importedBabelPlugins: Array<string> = [];
    const serializedJitiOptions = JSON.stringify(
      {
        ...ctx.options.stubOptions.jiti,
        alias: {
          ...resolveAliases(ctx),
          ...ctx.options.stubOptions.jiti.alias,
        },
        transformOptions: {
          ...ctx.options.stubOptions.jiti.transformOptions,
          babel: {
            ...ctx.options.stubOptions.jiti.transformOptions?.babel,
            plugins: "__$BABEL_PLUGINS",
          },
        },
      },
      null,
      2,
    ).replace(
      '"__$BABEL_PLUGINS"',
      Array.isArray(babelPlugins)
        ? "[" +
            babelPlugins
              .map((plugin: string | Array<any>, i) => {
                if (Array.isArray(plugin)) {
                  const [name, ...args] = plugin;
                  importedBabelPlugins.push(name);
                  return (
                    `[` +
                    [
                      `plugin${i}`,
                      ...args.map((val) => JSON.stringify(val)),
                    ].join(", ") +
                    "]"
                  );
                } else {
                  importedBabelPlugins.push(plugin);
                  return `plugin${i}`;
                }
              })
              .join(",") +
            "]"
        : "[]",
    );

    for (const entry of ctx.options.entries.filter(
      (entry) => entry.builder === "rollup",
    )) {
      const output = resolve(
        ctx.options.rootDir,
        ctx.options.outDir,
        entry.name!,
      );

      const isESM = ctx.pkg.type === "module";
      const resolvedEntry = normalize(
        ctx.jiti.esmResolve(entry.input, { try: true }) || entry.input,
      );
      const resolvedEntryWithoutExt = resolvedEntry.slice(
        0,
        Math.max(0, resolvedEntry.length - extname(resolvedEntry).length),
      );
      const resolvedEntryForTypeImport = isESM
        ? `${resolvedEntry.replace(/(\.m?)(ts)$/, "$1js")}`
        : resolvedEntryWithoutExt;
      const code = await fsp.readFile(resolvedEntry, "utf8");
      const shebang = getShebang(code);

      await mkdir(dirname(output), { recursive: true });

      // CJS Stub
      if (ctx.options.rollup.emitCJS) {
        const jitiCJSPath = relative(
          dirname(output),
          await resolvePath("jiti", {
            url: import.meta.url,
            conditions: ["node", "require"],
          }),
        );
        await writeFile(
          output + ".cjs",
          shebang +
            [
              `const { createJiti } = require(${JSON.stringify(jitiCJSPath)})`,
              ...importedBabelPlugins.map(
                (plugin, i) =>
                  `const plugin${i} = require(${JSON.stringify(plugin)})`,
              ),
              "",
              `const jiti = createJiti(__filename, ${serializedJitiOptions})`,
              "",
              `/** @type {import(${JSON.stringify(
                resolvedEntryForTypeImport,
              )})} */`,
              `module.exports = jiti(${JSON.stringify(resolvedEntry)})`,
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

      const jitiESMPath = relative(
        dirname(output),
        await resolvePath("jiti", {
          url: import.meta.url,
          conditions: ["node", "import"],
        }),
      );

      await writeFile(
        output + ".mjs",
        shebang +
          [
            `import { createJiti } from ${JSON.stringify(jitiESMPath)};`,
            ...importedBabelPlugins.map(
              (plugin, i) => `import plugin${i} from ${JSON.stringify(plugin)}`,
            ),
            "",
            `const jiti = createJiti(import.meta.url, ${serializedJitiOptions})`,
            "",
            `/** @type {import(${JSON.stringify(resolvedEntryForTypeImport)})} */`,
            `const _module = await jiti.import(${JSON.stringify(
              resolvedEntry,
            )});`,
            hasDefaultExport ? "\nexport default _module;" : "",
            ...namedExports
              .filter((name) => name !== "default")
              .map((name) => `export const ${name} = _module.${name};`),
          ].join("\n"),
      );

      // DTS Stub
      if (ctx.options.declaration) {
        const dtsContent = [
          `export * from ${JSON.stringify(resolvedEntryForTypeImport)};`,
          hasDefaultExport
            ? `export { default } from ${JSON.stringify(resolvedEntryForTypeImport)};`
            : "",
        ].join("\n");
        await writeFile(output + ".d.cts", dtsContent);
        await writeFile(output + ".d.mts", dtsContent);
        if (
          ctx.options.declaration === "compatible" ||
          ctx.options.declaration === true
        ) {
          await writeFile(output + ".d.ts", dtsContent);
        }
      }

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

  // Watch
  if (ctx.options.watch) {
    _watch(rollupOptions);
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
  const _aliases = resolveAliases(ctx);
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
      id = resolveAlias(id, _aliases);
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
          entries: _aliases,
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

// TODO: use pathe utils to handle nested aliases
function resolveAlias(id: string, aliases: Record<string, string>): string {
  for (const [find, replacement] of Object.entries(aliases)) {
    if (id.startsWith(find)) {
      return id.replace(find, replacement);
    }
  }
  return id;
}

export function _watch(rollupOptions: RollupOptions) {
  const watcher = rollupWatch(rollupOptions);

  let inputs: string[];
  if (Array.isArray(rollupOptions.input)) {
    inputs = rollupOptions.input;
  } else if (typeof rollupOptions.input === "string") {
    inputs = [rollupOptions.input];
  } else {
    inputs = Object.keys(rollupOptions.input || {});
  }
  consola.info(
    `[unbuild] [rollup] Starting watchers for entries: ${inputs.map((input) => "./" + relative(process.cwd(), input)).join(", ")}`,
  );

  consola.warn(
    "[unbuild] [rollup] Watch mode is experimental and may be unstable",
  );

  watcher.on("change", (id, { event }) => {
    consola.info(`${chalk.cyan(relative(".", id))} was ${event}d`);
  });

  watcher.on("restart", () => {
    consola.info(chalk.gray("[unbuild] [rollup] Rebuilding bundle"));
  });

  watcher.on("event", (event) => {
    if (event.code === "END") {
      consola.success(chalk.green("[unbuild] [rollup] Rebuild finished\n"));
    }
  });
}
