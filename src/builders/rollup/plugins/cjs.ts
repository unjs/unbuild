import type { Plugin } from "rollup";
import { findStaticImports } from "mlly";
import MagicString from "magic-string";

export function cjsPlugin(_opts?: any): Plugin {
  return {
    name: "unbuild-cjs",
    renderChunk(code, _chunk, opts) {
      if (opts.format === "es") {
        return CJSToESM(code);
      }
      return null;
    },
  } as Plugin;
}

// Ported from https://github.com/egoist/tsup/blob/cd03e1e00ec2bd6676ae1837cbc7e618ab6a2362/src/rollup.ts#L92-L109
export function fixCJSExportTypePlugin(): Plugin {
  return {
    name: "unbuild-fix-cjs-export-type",
    renderChunk(code, info, opts) {
      if (
        info.type !== "chunk" ||
        !info.fileName.endsWith(".d.cts") ||
        !info.isEntry ||
        info.exports?.length !== 1 ||
        info.exports[0] !== "default"
      ) {
        return;
      }

      return code.replace(
        /(?<=(?<=[;}]|^)\s*export\s*){\s*([\w$]+)\s*as\s+default\s*}/,
        `= $1`,
      );
    },
  } as Plugin;
}

const CJSyntaxRe = /__filename|__dirname|require\(|require\.resolve\(/;

const CJSShim = `

// -- Unbuild CommonJS Shims --
import __cjs_url__ from 'url';
import __cjs_path__ from 'path';
import __cjs_mod__ from 'module';
const __filename = __cjs_url__.fileURLToPath(import.meta.url);
const __dirname = __cjs_path__.dirname(__filename);
const require = __cjs_mod__.createRequire(import.meta.url);
`;

// Shim __dirname, __filename and require
function CJSToESM(code: string): { code: string; map: any } | null {
  if (code.includes(CJSShim) || !CJSyntaxRe.test(code)) {
    return null;
  }

  const lastESMImport = findStaticImports(code).pop();
  const indexToAppend = lastESMImport ? lastESMImport.end : 0;
  const s = new MagicString(code);
  s.appendRight(indexToAppend, CJSShim);

  return {
    code: s.toString(),
    map: s.generateMap(),
  };
}
