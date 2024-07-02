import { createFilter } from "@rollup/pluginutils";
import type { FilterPattern } from "@rollup/pluginutils";
import type { Plugin } from "rollup";

export interface RawLoaderOptions {
  include?: FilterPattern;
  exclude?: FilterPattern;
}

const defaults: RawLoaderOptions = {
  include: [/\.(md|txt|css|htm|html)$/],
  exclude: [],
};

export function rawPlugin(opts: RawLoaderOptions = {}): Plugin {
  opts = { ...opts, ...defaults };
  const filter = createFilter(opts.include, opts.exclude);
  return {
    name: "unbuild-raw",
    transform(code, id) {
      if (filter(id)) {
        return {
          code: `export default ${JSON.stringify(code)}`,
          map: null,
        };
      }
    },
  };
}
