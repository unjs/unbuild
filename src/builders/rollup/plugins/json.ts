import type { Plugin, TransformHook, TransformResult } from "rollup";
import type { RollupJsonOptions } from "@rollup/plugin-json";
import rollupJSONPlugin from "@rollup/plugin-json";

const EXPORT_DEFAULT = "export default ";

export function JSONPlugin(options: RollupJsonOptions): Plugin {
  const plugin = rollupJSONPlugin(options);
  return {
    ...plugin,
    name: "unbuild-json",
    transform(code, id): TransformResult {
      const res = (plugin.transform as TransformHook)!.call(this, code, id);
      if (
        res &&
        typeof res !== "string" &&
        "code" in res &&
        res.code &&
        res.code.startsWith(EXPORT_DEFAULT)
      ) {
        res.code = res.code.replace(EXPORT_DEFAULT, "module.exports = ");
      }
      return res;
    },
  } satisfies Plugin;
}
