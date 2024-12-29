import type { Plugin } from "rollup";
import { findExports, findStaticImports, findTypeExports } from "mlly";
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

export function fixCJSExportTypePlugin(): Plugin {
  const regexp = /export\s*\{([^}]*)\}/;
  return {
    name: "unbuild-fix-cjs-export-type",
    renderChunk(code, info, opts) {
      if (
        info.type !== "chunk" ||
        !(
          info.fileName.endsWith(".d.ts") || info.fileName.endsWith(".d.cts")
        ) ||
        !info.isEntry ||
        !info.exports?.length ||
        !info.exports.includes("default")
      ) {
        return;
      }

      const defaultExport = findExports(code).find((e) =>
        e.names.includes("default"),
      );
      if (!defaultExport) {
        return;
      }

      const match = defaultExport.code.match(regexp);
      if (!match?.length) {
        return;
      }

      let defaultAlias: string | undefined;
      const exportsEntries: string[] = [];

      for (const exp of match[1].split(",").map((e) => e.trim())) {
        if (exp.endsWith(" as default")) {
          defaultAlias = exp.replace(" as default", "");
        } else {
          exportsEntries.push(exp);
        }
      }

      if (!defaultAlias) {
        return;
      }

      const newExports =
        exportsEntries.length > 0
          ? `export = ${defaultAlias};\nexport { ${exportsEntries.join(", ")} }`
          : `export = ${defaultAlias}`;

      return code.replace(defaultExport.code, newExports);
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
