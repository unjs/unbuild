import type { Plugin } from "rollup";
import { findExports, findStaticImports } from "mlly";
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
  const defaultExportRegexp = /\s*as\s+default\s*/;
  const typeExportRegexp = /\s*type\s+/;
  return {
    name: "unbuild-fix-cjs-export-type",
    renderChunk(code, info) {
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
        const m = exp.match(defaultExportRegexp);
        if (m) {
          defaultAlias = exp.replace(m[0], "");
        } else {
          exportsEntries.push(exp);
        }
      }

      if (!defaultAlias) {
        return;
      }

      let exportStatement = exportsEntries.length > 0 ? undefined : "";

      // replace export { type A, type B, type ... } with export type { A, B, ... }
      // that's, if all remaining exports are type exports, replace export {} with export type {}
      if (exportStatement === undefined) {
        let someExternalExport = false;
        const allRemainingExports = exportsEntries.map((exp) => {
          if (someExternalExport) {
            return [exp, ""] as const;
          }
          if (!info.imports.includes(exp)) {
            const m = exp.match(typeExportRegexp);
            if (m) {
              const name = exp.replace(m[0], "").trim();
              if (!info.imports.includes(name)) {
                return [exp, name] as const;
              }
            }
          }
          someExternalExport = true;
          return [exp, ""] as const;
        });
        exportStatement = someExternalExport
          ? `\nexport { ${allRemainingExports.map(([e, _]) => e).join(", ")} }`
          : `\nexport type { ${allRemainingExports.map(([_, t]) => t).join(", ")} }`;
      }

      return code.replace(
        defaultExport.code,
        `export = ${defaultAlias}${exportStatement}`,
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
