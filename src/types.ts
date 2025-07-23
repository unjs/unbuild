import type { PackageJson } from "pkg-types";
import type { Hookable } from "hookable";
import type { RollupOptions as _RollupOptions, WatcherOptions } from "rollup";
import type { Jiti, JitiOptions } from "jiti";
import type {
  RollupBuildEntry,
  RollupBuildOptions,
  RollupHooks,
} from "./builders/rollup/types";
import type { MkdistBuildEntry, MkdistHooks } from "./builders/mkdist/types";
import type { CopyBuildEntry, CopyHooks } from "./builders/copy/types";
import type { UntypedBuildEntry, UntypedHooks } from "./builders/untyped/types";

export interface BaseBuildEntry {
  builder?: "untyped" | "rollup" | "mkdist" | "copy";
  input: string;
  name?: string;
  outDir?: string;
  declaration?: "compatible" | "node16" | boolean;
}

/** Bundler types */
export type {
  RollupBuildEntry,
  RollupBuildOptions,
  RollupOptions,
} from "./builders/rollup/types";
export type { MkdistBuildEntry } from "./builders/mkdist/types";
export type { CopyBuildEntry } from "./builders/copy/types";
export type {
  UntypedBuildEntry,
  UntypedOutput,
  UntypedOutputs,
} from "./builders/untyped/types";

export type BuildEntry =
  | BaseBuildEntry
  | RollupBuildEntry
  | UntypedBuildEntry
  | MkdistBuildEntry
  | CopyBuildEntry;

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
  watchOptions: WatcherOptions | undefined;

  /**
   * Stub options, where [jiti](https://github.com/unjs/jiti)
   * is an object of type `Omit<JitiOptions, "transform" | "onError">`.
   */
  stubOptions: {
    jiti: Omit<JitiOptions, "transform" | "onError">;
    absoluteJitiPath?: boolean;
  };

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

  /**
   * Run different types of builds (untyped, mkdist, Rollup, copy) simultaneously.
   */
  parallel: boolean;
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

export interface BuildHooks
  extends CopyHooks,
    UntypedHooks,
    MkdistHooks,
    RollupHooks {
  "build:prepare": (ctx: BuildContext) => void | Promise<void>;
  "build:before": (ctx: BuildContext) => void | Promise<void>;
  "build:done": (ctx: BuildContext) => void | Promise<void>;
}

export function defineBuildConfig(
  config: BuildConfig | BuildConfig[],
): BuildConfig[] {
  return (Array.isArray(config) ? config : [config]).filter(Boolean);
}

export function definePreset(preset: BuildPreset): BuildPreset {
  return preset;
}
