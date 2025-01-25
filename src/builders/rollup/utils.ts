import { dirname, resolve } from "pathe";
import type { PreRenderedChunk } from "rollup";
import type { BuildContext } from "../../types";

export const DEFAULT_EXTENSIONS: string[] = [
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".mjs",
  ".cjs",
  ".js",
  ".jsx",
  ".json",
];

export async function resolveAliases(
  ctx: BuildContext,
): Promise<Record<string, string>> {
  const aliases: Record<string, string> = {
    [ctx.pkg.name!]: ctx.options.rootDir,
    ...ctx.options.alias,
  };

  if (ctx.options.rollup.alias) {
    if (Array.isArray(ctx.options.rollup.alias.entries)) {
      Object.assign(
        aliases,
        Object.fromEntries(
          ctx.options.rollup.alias.entries.map((entry) => {
            return [entry.find, entry.replacement];
          }),
        ),
      );
    } else {
      Object.assign(
        aliases,
        ctx.options.rollup.alias.entries || ctx.options.rollup.alias,
      );
    }
  }

  /**
   * REVIEW: This makes alias resolution asynchronous (which is contagious),
   * because we are dynamic loading TypeScript (cause it's a peer dependency), 
   * or we can use a synchronous alternative [get-tsconfig](https://github.com/privatenumber/get-tsconfig).
   *
   * Additionally, do we need a flag to explicitly enable this feature?
   */
  const tsconfigAliases = await tryInferTsconfigAliases();
  if (tsconfigAliases) {
    Object.assign(aliases, tsconfigAliases);
  }

  return aliases;
}

async function tryInferTsconfigAliases(): Promise<Record<
  string,
  string
> | null> {
  const ts = await import("typescript").catch(() => null);

  if (!ts) {
    return null;
  }

  const tsconfigPath = ts.findConfigFile(
    process.cwd(),
    ts.sys.fileExists,
    "tsconfig.json",
  );

  if (!tsconfigPath) {
    return null;
  }

  const tsconfigDir = dirname(tsconfigPath);
  const { config: rawTsconfig } = ts.readConfigFile(
    tsconfigPath,
    ts.sys.readFile,
  );
  const { options: tsconfig } = ts.parseJsonConfigFileContent(
    rawTsconfig,
    ts.sys,
    tsconfigDir,
  );

  if (!tsconfig.paths) {
    return null;
  }

  const resolvedBaseUrl = resolve(tsconfigDir, tsconfig.baseUrl || ".");

  const aliases = Object.fromEntries(
    Object.entries(tsconfig.paths).map(([pattern, substitutions]) => {
      const find = pattern.replace(/\/\*$/, "");
      // Pick only the first path.
      const replacement = substitutions[0].replace(/\*$/, "");
      const resolvedReplacement = resolve(resolvedBaseUrl, replacement);
      return [find, resolvedReplacement];
    }),
  );

  return aliases;
}

export function getChunkFilename(
  ctx: BuildContext,
  chunk: PreRenderedChunk,
  ext: string,
): string {
  if (chunk.isDynamicEntry) {
    return `chunks/[name].${ext}`;
  }
  // TODO: Find a way to generate human friendly hash for short groups
  return `shared/${ctx.options.name}.[hash].${ext}`;
}
