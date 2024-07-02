import type { PreRenderedChunk } from "rollup";
import type { BuildContext } from "../../types";

export const DEFAULT_EXTENSIONS = [
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

  return aliases;
}

// TODO: use pathe utils to handle nested aliases
export function resolveAlias(
  id: string,
  aliases: Record<string, string>,
): string {
  for (const [find, replacement] of Object.entries(aliases)) {
    if (id.startsWith(find)) {
      return id.replace(find, replacement);
    }
  }
  return id;
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
