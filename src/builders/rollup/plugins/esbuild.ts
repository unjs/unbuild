// Based on https://github.com/egoist/rollup-plugin-esbuild and nitropack fork (MIT)
import type { Plugin, PluginContext } from "rollup";
import type { FilterPattern } from "@rollup/pluginutils";
import type { Loader, TransformResult, CommonOptions } from "esbuild";
import { transform } from "esbuild";
import { extname, relative } from "pathe";
import { createFilter } from "@rollup/pluginutils";

const DefaultLoaders: { [ext: string]: Loader } = {
  ".js": "js",
  ".mjs": "js",
  ".cjs": "js",

  ".ts": "ts",
  ".mts": "ts",
  ".cts": "ts",

  ".tsx": "tsx",
  ".jsx": "jsx",
};

export type EsbuildOptions = CommonOptions & {
  include?: FilterPattern;
  exclude?: FilterPattern;

  /**
   * Map extension to esbuild loader
   * Note that each entry (the extension) needs to start with a dot
   */
  loaders?: {
    [ext: string]: Loader | false;
  };
};

export function esbuild(options: EsbuildOptions): Plugin {
  // Extract esBuild options from additional options and apply defaults
  const {
    include = new RegExp(Object.keys(DefaultLoaders).join("|")),
    exclude = /node_modules/,
    loaders: loaderOptions,
    ...esbuildOptions
  } = options;

  // Rsolve loaders
  const loaders = { ...DefaultLoaders };
  if (loaderOptions) {
    for (const [key, value] of Object.entries(loaderOptions)) {
      if (typeof value === "string") {
        loaders[key] = value;
      } else if (value === false) {
        delete loaders[key];
      }
    }
  }
  const getLoader = (id = ""): Loader | undefined => {
    return loaders[extname(id)];
  };

  const filter = createFilter(include, exclude);

  return {
    name: "esbuild",

    async transform(code, id): Promise<null | { code: string; map: any }> {
      if (!filter(id)) {
        return null;
      }

      const loader = getLoader(id);
      if (!loader) {
        return null;
      }

      const result = await transform(code, {
        ...esbuildOptions,
        loader,
        sourcefile: id,
      });

      printWarnings(id, result, this);

      return result.code
        ? {
            code: result.code,
            map: result.map || null,
          }
        : null;
    },

    async renderChunk(
      code,
      { fileName },
    ): Promise<null | undefined | { code: string; map: any }> {
      if (!options.minify) {
        return null;
      }
      if (/\.d\.(c|m)?tsx?$/.test(fileName)) {
        return null;
      }
      const loader = getLoader(fileName);
      if (!loader) {
        return null;
      }
      const result = await transform(code, {
        ...esbuildOptions,
        loader,
        sourcefile: fileName,
        minify: true,
      });
      if (result.code) {
        return {
          code: result.code,
          map: result.map || null,
        };
      }
    },
  };
}

function printWarnings(
  id: string,
  result: TransformResult,
  plugin: PluginContext,
): void {
  if (result.warnings) {
    for (const warning of result.warnings) {
      let message = "[esbuild]";
      if (warning.location) {
        message += ` (${relative(process.cwd(), id)}:${warning.location.line}:${
          warning.location.column
        })`;
      }
      message += ` ${warning.text}`;
      plugin.warn(message);
    }
  }
}
