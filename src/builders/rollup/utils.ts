import { dirname, resolve } from "pathe";
import { 
  sys,
  findConfigFile, 
  readConfigFile, 
  parseJsonConfigFileContent, 
} from "typescript"
import type { CompilerOptions } from "typescript";
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

export function resolveAliases(ctx: BuildContext): Record<string, string> {
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

  const tsconfigAliases = inferAliasesFromTsconfig(ctx);
  if (tsconfigAliases) {
    Object.assign(aliases, tsconfigAliases);
  }

  return aliases;
}

function inferAliasesFromTsconfig(ctx: BuildContext): Record<
  string,
  string
> | undefined {
  const tsconfig = getTsconfig(ctx);

  if (!tsconfig.compilerOptions?.paths) {
    return;
  }

  const tsconfigDir = tsconfig.path 
    ? dirname(tsconfig.path) 
    : ctx.options.rootDir;
  
  const resolvedBaseUrl = resolve(tsconfigDir, tsconfig.compilerOptions?.baseUrl || ".");

  const aliases = Object.fromEntries(
    Object.entries(tsconfig.compilerOptions.paths).map(([pattern, substitutions]) => {
      const find = pattern.replace(/\/\*$/, "");
      // Pick only the first path.
      const replacement = substitutions[0].replace(/\*$/, "");
      const resolvedReplacement = resolve(resolvedBaseUrl, replacement);
      return [find, resolvedReplacement];
    }),
  );

  return aliases;
}

function getTsconfig(ctx: BuildContext): { 
  path?: string, 
  compilerOptions?: CompilerOptions 
} {
  const { 
    tsconfig: overridePath, 
    compilerOptions: overrideCompilerOptions 
  } = ctx.options.rollup.dts;

  const tsconfigPath = overridePath
    ? resolve(ctx.options.rootDir, overridePath)
    : findConfigFile(ctx.options.rootDir, sys.fileExists);

  if (!tsconfigPath) {
    return { compilerOptions: overrideCompilerOptions };
  }

  const { config: tsconfigRaw } = readConfigFile(
    tsconfigPath,
    sys.readFile,
  );
  const { options: compilerOptions } = parseJsonConfigFileContent(
    tsconfigRaw,
    sys,
    dirname(tsconfigPath),
  );

  return {
    path: tsconfigPath,
    compilerOptions: { ...compilerOptions, ...overrideCompilerOptions },
  }
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
