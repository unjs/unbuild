import type {
  RollupOptions as _RollupOptions,
  RollupBuild,
  OutputOptions,
  InputPluginOption,
  Plugin,
} from "rollup";
import type { RollupReplaceOptions } from "@rollup/plugin-replace";
import type { RollupAliasOptions } from "@rollup/plugin-alias";
import type { RollupNodeResolveOptions } from "@rollup/plugin-node-resolve";
import type { RollupJsonOptions } from "@rollup/plugin-json";
import type { Options as RollupDtsOptions } from "rollup-plugin-dts";
import type commonjs from "@rollup/plugin-commonjs";
import type { BaseBuildEntry } from "../../types";
import type { BuildContext } from "../../types";
import type { EsbuildOptions } from "./plugins/esbuild";

export type RollupCommonJSOptions = Parameters<typeof commonjs>[0] & {};

export interface RollupBuildEntry extends BaseBuildEntry {
  builder: "rollup";
}

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
   * Whether to inline dependencies not explicitly set in "dependencies" or "peerDependencies" or as marked externals to the bundle.
   *
   * If set to true, all such dependencies will be inlined.
   * If an array of string or regular expressions is passed, these will be used to determine whether to inline such a dependency.
   */
  inlineDependencies?: boolean | Array<string | RegExp>;

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
   * Read more: [rollup-plugin-dts](https://www.npmjs.com/package/rollup-plugin-dts)
   */
  dts: RollupDtsOptions;
}

export interface RollupOptions extends _RollupOptions {
  plugins: Plugin[];
}

export interface RollupHooks {
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
}
