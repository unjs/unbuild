import { promises as fsp } from "node:fs";
import { dirname, extname, resolve } from "pathe";

const JS_OUTPUT_RE = /\.(?:mjs|cjs|js)$/;

// Keep in sync with `resolveId` in mkdist: a per-entry `mkdist()` call only
// knows about the files it wrote itself.
const ESM_RESOLVE_EXTENSIONS = ["", "/index.mjs", "/index.js", ".mjs", ".js"];
const CJS_RESOLVE_EXTENSIONS = ["", "/index.cjs", ".cjs"];

const ESM_IMPORT_RE =
  /(import|export)(\s+(?:.+|{[\s\w,]+})\s+from\s+["'])(.*)(["'])/g;
const DYNAMIC_IMPORT_RE = /import\((["'])(.*)(["'])\)/g;
const REQUIRE_RE = /require\((["'])(.*)(["'])\)/g;

/**
 * Rewrite relative imports that point to an output produced by another
 * `mkdist` entry.
 *
 * `mkdist` resolves relative specifiers against the files written by a single
 * call, so with several entries an import such as `../common/config` keeps its
 * extensionless form even though the target lives in another entry's output
 * directory. Once all entries are built, the same resolution can be applied
 * against the union of every written file.
 */
export async function rewriteCrossEntryImports(
  writtenFiles: string[],
): Promise<void> {
  const fileSet = new Set(writtenFiles);
  await Promise.all(
    writtenFiles.map(async (file) => {
      if (!JS_OUTPUT_RE.test(file)) {
        return;
      }
      const isCJS = extname(file) === ".cjs";
      const extensions = isCJS
        ? CJS_RESOLVE_EXTENSIONS
        : ESM_RESOLVE_EXTENSIONS;
      const resolveId = (id: string): string => {
        if (!id.startsWith(".")) {
          return id;
        }
        for (const extension of extensions) {
          if (fileSet.has(resolve(dirname(file), id) + extension)) {
            return id + extension;
          }
        }
        return id;
      };
      const original = await fsp.readFile(file, "utf8");
      const rewritten = isCJS
        ? original.replace(
            REQUIRE_RE,
            (_, head: string, id: string, tail: string) =>
              "require(" + head + resolveId(id) + tail + ")",
          )
        : original
            .replace(
              ESM_IMPORT_RE,
              (_, type: string, head: string, id: string, tail: string) =>
                type + head + resolveId(id) + tail,
            )
            .replace(
              DYNAMIC_IMPORT_RE,
              (_, head: string, id: string, tail: string) =>
                "import(" + head + resolveId(id) + tail + ")",
            );
      if (rewritten !== original) {
        await fsp.writeFile(file, rewritten, "utf8");
      }
    }),
  );
}
