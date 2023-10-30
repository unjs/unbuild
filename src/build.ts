import Module from "node:module";
import { promises as fsp } from "node:fs";
import { resolve, relative, isAbsolute, normalize } from "pathe";
import type { PackageJson } from "pkg-types";
import chalk from "chalk";
import { consola } from "consola";
import { defu } from "defu";
import { createHooks } from "hookable";
import prettyBytes from "pretty-bytes";
import { globby } from "globby";
import {
  dumpObject,
  rmdir,
  tryRequire,
  resolvePreset,
  removeExtension,
} from "./utils";
import type { BuildContext, BuildConfig, BuildOptions } from "./types";
import { validatePackage, validateDependencies } from "./validate";
import { rollupBuild } from "./builder/rollup";
import { typesBuild } from "./builder/untyped";
import { mkdistBuild } from "./builder/mkdist";

export async function build(
  rootDir: string,
  stub: boolean,
  inputConfig: BuildConfig = {},
) {
  // Determine rootDir
  rootDir = resolve(process.cwd(), rootDir || ".");

  const _buildConfig: BuildConfig | BuildConfig[] =
    tryRequire("./build.config", rootDir) || {};
  const buildConfigs = (
    Array.isArray(_buildConfig) ? _buildConfig : [_buildConfig]
  ).filter(Boolean);

  const pkg: PackageJson & Record<"unbuild" | "build", BuildConfig> =
    tryRequire("./package.json", rootDir) || {};

  // Invoke build for every build config defined in build.config.ts
  const cleanedDirs: string[] = [];
  for (const buildConfig of buildConfigs) {
    await _build(rootDir, stub, inputConfig, buildConfig, pkg, cleanedDirs);
  }
}

async function _build(
  rootDir: string,
  stub: boolean,
  inputConfig: BuildConfig = {},
  buildConfig: BuildConfig,
  pkg: PackageJson & Record<"unbuild" | "build", BuildConfig>,
  cleanedDirs: string[],
) {
  // Resolve preset
  const preset = resolvePreset(
    buildConfig.preset ||
      pkg.unbuild?.preset ||
      pkg.build?.preset ||
      inputConfig.preset ||
      "auto",
    rootDir,
  );

  // Merge options
  const options = defu(
    buildConfig,
    pkg.unbuild || pkg.build,
    inputConfig,
    preset,
    <BuildOptions>{
      name: (pkg?.name || "").split("/").pop() || "default",
      rootDir,
      entries: [],
      clean: true,
      declaration: false,
      outDir: "dist",
      stub,
      stubOptions: {
        /**
         * See https://github.com/unjs/jiti#options
         */
        jiti: {
          esmResolve: true,
          interopDefault: true,
          alias: {},
        },
      },
      externals: [
        ...Module.builtinModules,
        ...Module.builtinModules.map((m) => "node:" + m),
      ],
      dependencies: [],
      devDependencies: [],
      peerDependencies: [],
      alias: {},
      replace: {},
      failOnWarn: true,
      sourcemap: false,
      rollup: {
        emitCJS: false,
        cjsBridge: false,
        inlineDependencies: false,
        preserveDynamicImports: true,
        // Plugins
        replace: {
          preventAssignment: true,
        },
        alias: {},
        resolve: {
          preferBuiltins: true,
        },
        json: {
          preferConst: true,
        },
        commonjs: {
          ignoreTryCatch: true,
        },
        esbuild: { target: "es2020" },
        dts: {
          // https://github.com/Swatinem/rollup-plugin-dts/issues/143
          compilerOptions: { preserveSymlinks: false },
          respectExternal: true,
        },
      },
    },
  ) as BuildOptions;

  // Resolve dirs relative to rootDir
  options.outDir = resolve(options.rootDir, options.outDir);

  // Build context
  const ctx: BuildContext = {
    options,
    warnings: new Set(),
    pkg,
    buildEntries: [],
    usedImports: new Set(),
    hooks: createHooks(),
  };

  // Register hooks
  if (preset.hooks) {
    ctx.hooks.addHooks(preset.hooks);
  }
  if (inputConfig.hooks) {
    ctx.hooks.addHooks(inputConfig.hooks);
  }
  if (buildConfig.hooks) {
    ctx.hooks.addHooks(buildConfig.hooks);
  }

  // Allow prepare and extending context
  await ctx.hooks.callHook("build:prepare", ctx);

  // Normalize entries
  options.entries = options.entries.map((entry) =>
    typeof entry === "string" ? { input: entry } : entry,
  );

  for (const entry of options.entries) {
    if (typeof entry.name !== "string") {
      let relativeInput = isAbsolute(entry.input)
        ? relative(rootDir, entry.input)
        : normalize(entry.input);
      if (relativeInput.startsWith("./")) {
        relativeInput = relativeInput.slice(2);
      }
      entry.name = removeExtension(relativeInput.replace(/^src\//, ""));
    }

    if (!entry.input) {
      throw new Error("Missing entry input: " + dumpObject(entry));
    }

    if (!entry.builder) {
      entry.builder = entry.input.endsWith("/") ? "mkdist" : "rollup";
    }

    if (options.declaration !== undefined && entry.declaration === undefined) {
      entry.declaration = options.declaration;
    }

    entry.input = resolve(options.rootDir, entry.input);
    entry.outDir = resolve(options.rootDir, entry.outDir || options.outDir);
  }

  // Infer dependencies from pkg
  options.dependencies = Object.keys(pkg.dependencies || {});
  options.peerDependencies = Object.keys(pkg.peerDependencies || {});
  options.devDependencies = Object.keys(pkg.devDependencies || {});

  // Add all dependencies as externals
  options.externals.push(...options.dependencies, ...options.peerDependencies);

  // Call build:before
  await ctx.hooks.callHook("build:before", ctx);

  // Start info
  consola.info(
    chalk.cyan(`${options.stub ? "Stubbing" : "Building"} ${options.name}`),
  );
  if (process.env.DEBUG) {
    consola.info(`${chalk.bold("Root dir:")} ${options.rootDir}
  ${chalk.bold("Entries:")}
  ${options.entries.map((entry) => "  " + dumpObject(entry)).join("\n  ")}
`);
  }

  // Clean dist dirs
  if (options.clean) {
    for (const dir of new Set(
      options.entries
        .map((e) => e.outDir)
        .filter(Boolean)
        .sort() as unknown as Set<string>,
    )) {
      if (cleanedDirs.some((c) => dir.startsWith(c))) {
        continue;
      }
      cleanedDirs.push(dir);
      consola.info(
        `Cleaning dist directory: \`./${relative(process.cwd(), dir)}\``,
      );
      await rmdir(dir);
      await fsp.mkdir(dir, { recursive: true });
    }
  }

  // Try to selflink
  // if (ctx.stub && ctx.pkg.name) {
  //   const nodemodulesDir = resolve(ctx.rootDir, 'node_modules', ctx.pkg.name)
  //   await symlink(resolve(ctx.rootDir), nodemodulesDir).catch(() => {})
  // }

  // untyped
  await typesBuild(ctx);

  // mkdist
  await mkdistBuild(ctx);

  // rollup
  await rollupBuild(ctx);

  // Skip rest for stub
  if (options.stub) {
    await ctx.hooks.callHook("build:done", ctx);
    return;
  }

  // Done info
  consola.success(chalk.green("Build succeeded for " + options.name));

  // Find all dist files and add missing entries as chunks
  const outFiles = await globby("**", { cwd: options.outDir });
  for (const file of outFiles) {
    let entry = ctx.buildEntries.find((e) => e.path === file);
    if (!entry) {
      entry = {
        path: file,
        chunk: true,
      };
      ctx.buildEntries.push(entry);
    }
    if (!entry.bytes) {
      const stat = await fsp.stat(resolve(options.outDir, file));
      entry.bytes = stat.size;
    }
  }

  const rPath = (p: string) =>
    relative(process.cwd(), resolve(options.outDir, p));
  for (const entry of ctx.buildEntries.filter((e) => !e.chunk)) {
    let totalBytes = entry.bytes || 0;
    for (const chunk of entry.chunks || []) {
      totalBytes += ctx.buildEntries.find((e) => e.path === chunk)?.bytes || 0;
    }
    let line =
      `  ${chalk.bold(rPath(entry.path))} (` +
      [
        totalBytes && `total size: ${chalk.cyan(prettyBytes(totalBytes))}`,
        entry.bytes && `chunk size: ${chalk.cyan(prettyBytes(entry.bytes))}`,
        entry.exports?.length &&
          `exports: ${chalk.gray(entry.exports.join(", "))}`,
      ]
        .filter(Boolean)
        .join(", ") +
      ")";
    if (entry.chunks?.length) {
      line +=
        "\n" +
        entry.chunks
          .map((p) => {
            const chunk =
              ctx.buildEntries.find((e) => e.path === p) || ({} as any);
            return chalk.gray(
              "  └─ " +
                rPath(p) +
                chalk.bold(
                  chunk.bytes ? ` (${prettyBytes(chunk?.bytes)})` : "",
                ),
            );
          })
          .join("\n");
    }
    if (entry.modules?.length) {
      line +=
        "\n" +
        entry.modules
          .filter((m) => m.id.includes("node_modules"))
          .sort((a, b) => (b.bytes || 0) - (a.bytes || 0))
          .map((m) => {
            return chalk.gray(
              "  📦 " +
                rPath(m.id) +
                chalk.bold(m.bytes ? ` (${prettyBytes(m.bytes)})` : ""),
            );
          })
          .join("\n");
    }
    consola.log(entry.chunk ? chalk.gray(line) : line);
  }
  console.log(
    "Σ Total dist size (byte size):",
    chalk.cyan(
      prettyBytes(ctx.buildEntries.reduce((a, e) => a + (e.bytes || 0), 0)),
    ),
  );

  // Validate
  validateDependencies(ctx);
  validatePackage(pkg, rootDir, ctx);

  // Call build:done
  await ctx.hooks.callHook("build:done", ctx);

  consola.log("");

  if (ctx.warnings.size > 0) {
    consola.warn(
      "Build is done with some warnings:\n\n" +
        [...ctx.warnings].map((msg) => "- " + msg).join("\n"),
    );
    if (ctx.options.failOnWarn) {
      consola.error(
        "Exiting with code (1). You can change this behavior by setting `failOnWarn: false` .",
      );
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  }
}
