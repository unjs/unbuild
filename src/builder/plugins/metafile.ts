import { writeFile } from "node:fs/promises";
import type { Plugin } from "rollup";
import { resolve } from "pathe";
import { dumpObject } from "../../utils";

export interface MetafileOptions {
  enable?: boolean;
  outDir?: string;
}

export interface MetaInfo {
  source: string;
  target: string;
}

export function metafilePlugin(opts: MetafileOptions = {}): Plugin {
  let ctr: number = 0
  return {
    name: "unbuild-metafile",
    async buildEnd(err) {
      if (!err && opts.enable) {
        if (!opts.outDir) {
          throw new Error(
            "Missing outDir for Metafile Plugin: " + dumpObject(opts),
          );
        }

        const deps: MetaInfo[] = [];

        for (const id of this.getModuleIds()) {
          const m = this.getModuleInfo(id);
          if (m != null && !m.isExternal) {
            for (const target of m.importedIds) {
              deps.push({ source: m.id, target });
            }
          }
        }

        if (Array.isArray(deps) && deps.length === 0) {
          return;
        }

        const outPath = resolve(opts.outDir, `graph.${++ctr}.json`);
        await writeFile(outPath, JSON.stringify(deps), "utf8");
      }
    },
  } as Plugin;
}
