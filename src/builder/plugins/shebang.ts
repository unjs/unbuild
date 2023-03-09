import { promises as fsp } from "node:fs";
import MagicString from "magic-string";
import { resolve } from "pathe";
import type { Plugin } from "rollup";

// Forked from https://github.com/developit/rollup-plugin-preserve-shebang (1.0.1 @ MIT)

const SHEBANG_RE = /^#![^\n]*/;

export interface ShebangPluginOptions {
  preserve?: boolean;
}

export function shebangPlugin(options: ShebangPluginOptions = {}): Plugin {
  const shebangs = new Map();
  return {
    name: "unbuild-shebang",
    // @ts-ignore temp workaround
    _options: options,
    transform(code, mod) {
      let shebang;
      code = code.replace(SHEBANG_RE, (match) => {
        shebang = match;
        return "";
      });
      if (!shebang) {
        return null;
      }
      shebangs.set(mod, shebang);
      return { code, map: null };
    },
    renderChunk(code, chunk, { sourcemap }) {
      if (options.preserve === false) {
        return null;
      }
      const shebang = shebangs.get(chunk.facadeModuleId);
      if (!shebang) {
        return null;
      }
      const s = new MagicString(code);
      s.prepend(`${shebang}\n`);
      return {
        code: s.toString(),
        map: sourcemap ? s.generateMap({ hires: true }) : null,
      };
    },
    async writeBundle(options, bundle) {
      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type !== "chunk") {
          continue;
        }
        if (output.code?.match(SHEBANG_RE)) {
          const outFile = resolve(options.dir!, fileName);
          await makeExecutable(outFile);
        }
      }
    },
  };
}

export async function makeExecutable(filePath: string) {
  await fsp.chmod(filePath, 0o755 /* rwx r-x r-x */).catch(() => {});
}

export function getShebang(code: string, append = "\n") {
  const m = code.match(SHEBANG_RE);
  return m ? m + append : "";
}
