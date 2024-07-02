import type { PackageJson } from "pkg-types";
import type { Hookable } from "hookable";
import type {
  RollupOptions as _RollupOptions,
  RollupBuild,
  OutputOptions,
  WatcherOptions,
  InputPluginOption,
} from "rollup";
import type { MkdistOptions } from "mkdist";
import type { Schema } from "untyped";
import type { RollupReplaceOptions } from "@rollup/plugin-replace";
import type { RollupAliasOptions } from "@rollup/plugin-alias";
import type { RollupNodeResolveOptions } from "@rollup/plugin-node-resolve";
import type { RollupJsonOptions } from "@rollup/plugin-json";
import type { Options as RollupDtsOptions } from "rollup-plugin-dts";
import type commonjs from "@rollup/plugin-commonjs";
import type { Jiti, JitiOptions } from "jiti";
import type { EsbuildOptions } from "./builder/plugins/esbuild";

// eslint-disable-next-line @typescript-eslint/ban-types
export type RollupCommonJSOptions = Parameters<typeof commonjs>[0] & {};

export interface BaseBuildEntry {
  builder?: "untyped" | "rollup" | "mkdist" | "copy";
  input: string;
  name?: string;
  outDir?: string;
  declaration?: "compatible" | "node16" | boolean;
}

export interface UntypedBuildEntry extends BaseBuildEntry {
  builder: "untyped";
  defaults?: Record<string, any>;
}

export interface RollupBuildEntry extends BaseBuildEntry {
  builder: "rollup";
}

type _BaseAndMkdist = BaseBuildEntry & MkdistOptions;
export interface MkdistBuildEntry extends _BaseAndMkdist {
  builder: "mkdist";
}

export interface CopyBuildEntry extends BaseBuildEntry {
  builder: "copy";
  pattern?: string | string[];
}

export type BuildEntry =
  | BaseBuildEntry
  | RollupBuildEntry
  | UntypedBuildEntry
  | MkdistBuildEntry
  | CopyBuildEntry;

export interface RollupBuildOptions {
  /**
   * If enabled, unbuild generates a CommonJS build in addition to the ESM build.
   */
  emitCJS?: boolean;

  /**
   * Enable experimental active watcher
   *
   * @experimental
   */
  watch?: boolean;

  /**
   * If enabled, unbuild generates CommonJS polyfills for ESM builds.
   */
  cjsBridge?: boolean;

  /**
   * Preserve dynamic imports as-is
   */
  preserveDynamicImports?: boolean;

  /**
   * Inline dependencies nor explicitly set in "dependencies" or "peerDependencies" or as marked externals to the bundle.
   */
  inlineDependencies?: boolean;

  /**
   * Rollup [Output Options](https://rollupjs.org/configuration-options)
   */
  output?: OutputOptions;

  /**
   * Replace plugin options
   * Set to `false` to disable the plugin.
   * Read more: [@rollup/plugin-replace](https://www.npmjs.com/package/@rollup/plugin-replace)
   */
  replace: RollupReplaceOptions | false;

  /**
   * Alias plugin options
   * Set to `false` to disable the plugin.
   * Read more: [@rollup/plugin-alias](https://www.npmjs.com/package/@rollup/plugin-alias)
   */
  alias: RollupAliasOptions | false;

  /**
   * Resolve plugin options
   * Set to `false` to disable the plugin.
   * Read more: [@rollup/plugin-node-resolve](https://www.npmjs.com/package/@rollup/plugin-node-resolve)
   */
  resolve: RollupNodeResolveOptions | false;

  /**
   * JSON plugin options
   * Set to `false` to disable the plugin.
   * Read more: [@rollup/plugin-json](https://www.npmjs.com/package/@rollup/plugin-json)
   */
  json: RollupJsonOptions | false;

  /**
   * ESBuild plugin options
   * Set to `false` to disable the plugin.
   * Read more: [esbuild](https://www.npmjs.com/package/esbuild)
   */
  esbuild: EsbuildOptions | false;

  /**
   * CommonJS plugin options
   * Set to `false` to disable the plugin.
   * Read more: [@rollup/plugin-commonjs](https://www.npmjs.com/package/@rollup/plugin-commonjs)
   */
  commonjs: RollupCommonJSOptions | false;

  /**
   * DTS plugin options
   * Set to `false` to disable the plugin.
   * Read more: [rollup-plugin-dts](https://www.npmjs.com/package/rollup-plugin-dts)
   */
  dts: RollupDtsOptions;
}

export interface BuildOptions {
  /**
   * The name of the project.
   */
  name: string;

  /**
   * The root directory of the project.
   */
  rootDir: string;

  /**
   * Build entries.
   */
  entries: BuildEntry[];

  /**
   * Clean the output directory before building.
   */
  clean: boolean;

  /**
   * @experimental
   * Generate source mapping file.
   */
  sourcemap: boolean;

  /**
   * Whether to generate declaration files.
   * * `compatible` means "src/index.ts" will generate "dist/index.d.mts", "dist/index.d.cts" and "dist/index.d.ts".
   * * `node16` means "src/index.ts" will generate "dist/index.d.mts" and "dist/index.d.cts".
   * * `true` is equivalent to `compatible`.
   * * `false` will disable declaration generation.
   * * `undefined` will auto detect based on "package.json". If "package.json" has "types" field, it will be `"compatible"`, otherwise `false`.
   */
  declaration?: "compatible" | "node16" | boolean;

  /**
   * Output directory.
   */
  outDir: string;

  /**
   * Whether to build with JIT stubs.
   * Read more: [stubbing](https://antfu.me/posts/publish-esm-and-cjs#stubbing)
   */
  stub: boolean;

  /**
   * Whether to build and actively watch the file changes.
   *
   * @experimental This feature is experimental and incomplete.
   */
  watch: boolean;

  /**
   * Watch mode options.
   */
  watchOptions: WatcherOptions;

  /**
   * Stub options, where [jiti](https://github.com/unjs/jiti)
   * is an object of type `Omit<JitiOptions, "transform" | "onError">`.
   */
  stubOptions: { jiti: Omit<JitiOptions, "transform" | "onError"> };

  /**
   * Used to specify which modules or libraries should be considered external dependencies
   * and not included in the final build product.
   */
  externals: (string | RegExp)[];

  dependencies: string[];

  peerDependencies: string[];

  devDependencies: string[];

  /**
   * Create aliases for module imports to reference modules in code using more concise paths.
   * Allow you to specify an alias for the module path.
   */
  alias: { [find: string]: string };

  /**
   * Replace the text in the source code with rules.
   */
  replace: { [find: string]: string };

  /**
   * Terminate the build process when a warning appears
   */
  failOnWarn?: boolean;

  /**
   * [Rollup](https://rollupjs.org/configuration-options) Build Options
   */
  rollup: RollupBuildOptions;
}

export interface BuildContext {
  options: BuildOptions;
  pkg: PackageJson;
  jiti: Jiti;
  buildEntries: {
    path: string;
    bytes?: number;
    exports?: string[];
    chunks?: string[];
    chunk?: boolean;
    modules?: { id: string; bytes: number }[];
  }[];

  usedImports: Set<string>;
  warnings: Set<string>;
  hooks: Hookable<BuildHooks>;
}

export type BuildPreset = BuildConfig | (() => BuildConfig);

type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

/**
 * In addition to basic `entries`, `presets`, and `hooks`,
 * there are also all the properties of `BuildOptions` except for BuildOptions's `entries`.
 */
export interface BuildConfig
  extends DeepPartial<Omit<BuildOptions, "entries">> {
  /**
   * Specify the entry file or entry module during the construction process.
   */
  entries?: (BuildEntry | string)[];

  /**
   * Used to specify the preset build configuration.
   */
  preset?: string | BuildPreset;

  /**
   * Used to define hook functions during the construction process to perform custom operations during specific construction stages.
   * This configuration allows you to insert custom logic during the build process to meet specific requirements or perform additional operations.
   */
  hooks?: Partial<BuildHooks>;
}

export interface UntypedOutput {
  fileName: string;
  contents: string;
}

export interface UntypedOutputs {
  markdown: UntypedOutput;
  schema: UntypedOutput;
  defaults: UntypedOutput;
  declaration?: UntypedOutput;
}

export interface RollupOptions extends _RollupOptions {
  plugins: InputPluginOption[];
}

export interface BuildHooks {
  "build:prepare": (ctx: BuildContext) => void | Promise<void>;
  "build:before": (ctx: BuildContext) => void | Promise<void>;
  "build:done": (ctx: BuildContext) => void | Promise<void>;

  "rollup:options": (
    ctx: BuildContext,
    options: RollupOptions,
  ) => void | Promise<void>;
  "rollup:build": (
    ctx: BuildContext,
    build: RollupBuild,
  ) => void | Promise<void>;
  "rollup:dts:options": (
    ctx: BuildContext,
    options: RollupOptions,
  ) => void | Promise<void>;
  "rollup:dts:build": (
    ctx: BuildContext,
    build: RollupBuild,
  ) => void | Promise<void>;
  "rollup:done": (ctx: BuildContext) => void | Promise<void>;

  "mkdist:entries": (
    ctx: BuildContext,
    entries: MkdistBuildEntry[],
  ) => void | Promise<void>;
  "mkdist:entry:options": (
    ctx: BuildContext,
    entry: MkdistBuildEntry,
    options: MkdistOptions,
  ) => void | Promise<void>;
  "mkdist:entry:build": (
    ctx: BuildContext,
    entry: MkdistBuildEntry,
    output: { writtenFiles: string[] },
  ) => void | Promise<void>;
  "mkdist:done": (ctx: BuildContext) => void | Promise<void>;

  "untyped:entries": (
    ctx: BuildContext,
    entries: UntypedBuildEntry[],
  ) => void | Promise<void>;
  "untyped:entry:options": (
    ctx: BuildContext,
    entry: UntypedBuildEntry,
    options: any,
  ) => void | Promise<void>;
  "untyped:entry:schema": (
    ctx: BuildContext,
    entry: UntypedBuildEntry,
    schema: Schema,
  ) => void | Promise<void>;
  "untyped:entry:outputs": (
    ctx: BuildContext,
    entry: UntypedBuildEntry,
    outputs: UntypedOutputs,
  ) => void | Promise<void>;
  "untyped:done": (ctx: BuildContext) => void | Promise<void>;

  "copy:entries": (
    ctx: BuildContext,
    entries: CopyBuildEntry[],
  ) => void | Promise<void>;
  "copy:done": (ctx: BuildContext) => void | Promise<void>;
}

export function defineBuildConfig(
  config: BuildConfig | BuildConfig[],
): BuildConfig[] {
  return (Array.isArray(config) ? config : [config]).filter(Boolean);
}

export function definePreset(preset: BuildPreset): BuildPreset {
  return preset;
}
