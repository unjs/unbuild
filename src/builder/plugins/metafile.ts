import { writeFile } from "node:fs/promises";
import type { Plugin } from "rollup";
import { resolve } from "pathe";

export interface MetafileOptions {
  rootDir: string;
  outDir: string;
}

export interface MetaInfo {
  source: string;
  target: string;
}

export function metafilePlugin(opts: MetafileOptions): Plugin {
  return {
    name: "unbuild:metafile",
    async buildEnd() {
      const deps: MetaInfo[] = [];

      for (const id of this.getModuleIds()) {
        const m = this.getModuleInfo(id);
        if (m != null && !m.isExternal) {
          for (const target of m.importedIds) {
            deps.push({
              source: id,
              target,
            });
          }
        }
      }

      if (Array.isArray(deps) && deps.length === 0) {
        return;
      }

      const outPath = resolve(opts.outDir, `graph.json`);
      await writeFile(outPath, JSON.stringify(deps, null, 2), "utf8");
    },
  } as Plugin;
}
