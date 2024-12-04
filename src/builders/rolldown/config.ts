import type { PreRenderedChunk, RolldownOptions } from "rolldown";
import type { BuildContext, RolldownBuildEntry } from "../../types";
import { isAbsolute, resolve } from "pathe";
import { getChunkFilename, resolveAlias, resolveAliases } from "../rollup/utils";
import { arrayIncludes, getpkg, warn } from "../../utils";

export function getRolldownOptions(ctx: BuildContext): RolldownOptions[] {
  /** Define rolldown confits */
  const configs: RolldownOptions[] = [
    // add base config for ESM
    getConfig(ctx, false),
  ];

  /** Add CJS config if needed */
  if (ctx.options.rollup.emitCJS) {
    configs.push(getConfig(ctx, true));
  }

  return configs;

}

function getConfig(ctx: BuildContext, emitCJS = false): RolldownOptions {
  /** Define helpers */
  const isCJS = emitCJS ?? false;
  const moduleType = (isCJS) ? "cjs" : "mjs";
  const format = (isCJS) ? "cjs" : "esm";

  /** Define aliases */
  const _aliases = resolveAliases(ctx);

  /** Define inputs */
  const _input = Object.fromEntries(
    ctx.options.entries
      .filter((entry) => entry.builder === "rolldown")
      .map((entry) => [
        entry.name,
        resolve(ctx.options.rootDir, entry.input),
      ]),
  );
  
  /** Define output */
  const _output: RolldownOptions["output"] = {
    dir: resolve(ctx.options.rootDir, ctx.options.outDir),
    entryFileNames: `[name].${moduleType}`,
    chunkFileNames: (chunk: PreRenderedChunk) => {
      return getChunkFilename(ctx, chunk, moduleType);
    },
    format,
    exports: "auto",
    externalLiveBindings: true,
    sourcemap: ctx.options.sourcemap,
  }

  return {
    input: _input,
    output: _output,
    external(id): boolean {
      id = resolveAlias(id, _aliases);
      const pkg = getpkg(id);
      const isExplicitExternal =
        arrayIncludes(ctx.options.externals, pkg) ||
        arrayIncludes(ctx.options.externals, id);
      if (isExplicitExternal) {
        return true;
      }
      if (
        ctx.options.rollup.inlineDependencies ||
        id[0] === "." ||
        isAbsolute(id) ||
        /src[/\\]/.test(id) ||
        id.startsWith(ctx.pkg.name!)
      ) {
        return false;
      }
      if (!isExplicitExternal) {
        warn(ctx, `Inlined implicit external ${id}`);
      }
      return isExplicitExternal;
    },
    onwarn(warning, rolldownWarn): void {
      if (!warning.code || !["CIRCULAR_DEPENDENCY"].includes(warning.code)) {
        rolldownWarn(warning);
      }
    },
  }
}