// Based on https://github.com/egoist/rollup-plugin-esbuild and nitropack fork (MIT)

import { extname, relative } from "pathe";
import type { Plugin, PluginContext } from "rollup";
import { Loader, TransformResult, transform } from "esbuild";
import { createFilter } from "@rollup/pluginutils";
import type { FilterPattern } from "@rollup/pluginutils";

const defaultLoaders: { [ext: string]: Loader } = {
  ".ts": "ts",
  ".js": "js",
};

export interface Options {
  include?: FilterPattern;
  exclude?: FilterPattern;
  sourceMap?: boolean;
  minify?: boolean;
  target: string | string[];
  jsxFactory?: string;
  jsxFragment?: string;
  define?: {
    [k: string]: string;
  };
  /**
   * Use this tsconfig file instead
   * Disable it by setting to `false`
   */
  tsconfig?: string | false;
  /**
   * Map extension to esbuild loader
   * Note that each entry (the extension) needs to start with a dot
   */
  loaders?: {
    [ext: string]: Loader | false;
  };
}

export function esbuild(options: Options): Plugin {
  const loaders = {
    ...defaultLoaders,
  };

  if (options.loaders) {
    for (const key of Object.keys(options.loaders)) {
      const value = options.loaders[key];
      if (typeof value === "string") {
        loaders[key] = value;
      } else if (value === false) {
        delete loaders[key];
      }
    }
  }

  const extensions: string[] = Object.keys(loaders);
  const INCLUDE_REGEXP = new RegExp(
    `\\.(${extensions.map((ext) => ext.slice(1)).join("|")})$`
  );
  const EXCLUDE_REGEXP = /node_modules/;

  const filter = createFilter(
    options.include || INCLUDE_REGEXP,
    options.exclude || EXCLUDE_REGEXP
  );

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
        loader,
        target: options.target,
        define: options.define,
        sourcemap: options.sourceMap,
        sourcefile: id,
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
