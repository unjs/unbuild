// Based on https://github.com/egoist/rollup-plugin-esbuild and nitropack fork (MIT)

import { extname, relative } from "pathe";
import type { Plugin, PluginContext } from "rollup";
import { Loader, TransformResult, CommonOptions, transform } from "esbuild";
import { createFilter } from "@rollup/pluginutils";
import type { FilterPattern } from "@rollup/pluginutils";

const DefaultLoaders: { [ext: string]: Loader } = {
  ".ts": "ts",
  ".js": "js",
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
    include = /\.(ts|js|tsx|jsx)$/,
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

  const filter = createFilter(include, exclude);

  return {
    name: "esbuild",

    async transform(code, id) {
      if (!filter(id)) {
        return null;
      }

      const ext = extname(id);
      const loader = loaders[ext];

      if (!loader) {
        return null;
      }

      const result = await transform(code, {
        ...esbuildOptions,
        loader,
        sourcefile: id,
        sourcemap: options.sourcemap,
      });

      printWarnings(id, result, this);

      return (
        result.code && {
          code: result.code,
          map: result.map || null,
        }
      );
    },

    async renderChunk(code, { fileName }) {
      if (options.minify && !fileName.endsWith(".d.ts")) {
        const result = await transform(code, {
          loader: "js",
          minify: true,
          target: options.target,
        });
        if (result.code) {
          return {
            code: result.code,
            map: result.map || null,
          };
        }
      }
      return null;
    },
  };
}

function printWarnings(
  id: string,
  result: TransformResult,
  plugin: PluginContext
) {
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
