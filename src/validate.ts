import type { PackageJson } from "pkg-types";
import type { BuildContext } from "./types";
import { existsSync } from "node:fs";
import { consola } from "consola";
import { colors } from "consola/utils";
import { resolvePkgEntries, warn } from "./utils";

export function validateBuild(ctx: BuildContext): Set<string> {
  if (ctx.implicitDependencies.size > 0) {
    const message = `These dependencies are implicitly bundled: ${_joinWarnings(ctx.implicitDependencies)}`;
    warn(ctx, message);
  }

  if (ctx.hoistedDependencies.size > 0) {
    const message = `These dependencies are shamefully hoisted: ${_joinWarnings(ctx.hoistedDependencies)}`;
    warn(ctx, message);
  }

  return ctx.warnings;
}

export function validateBuilds(
  contexts: BuildContext[],
  pkg: PackageJson,
  rootDir: string,
): Set<string> {
  const warnings = new Set<string>();

  const usedDependencies = new Set(
    contexts.flatMap((ctx) => [...ctx.usedDependencies]),
  );
  const unusedDependencies = Object.keys(pkg.dependencies || {}).filter(
    (i) => !usedDependencies.has(i),
  );
  if (unusedDependencies.length > 0) {
    const message = `These dependencies are listed in package.json but not used: ${_joinWarnings(unusedDependencies)}`;
    consola.debug("[unbuild] [warn]", message);
    warnings.add(message);
  }

  const missingOutputs = resolvePkgEntries(pkg, rootDir)
    .filter((entry) => !existsSync(entry.path))
    .map((entry) => entry.name);
  if (missingOutputs.length > 0) {
    const message = `These files are declared in package.json but not generated: ${_joinWarnings(missingOutputs)}`;
    consola.debug("[unbuild] [warn]", message);
    warnings.add(message);
  }

  return warnings;
}

function _joinWarnings(warnings: Set<string> | string[]): string {
  return [...warnings].map((id) => colors.yellow(id)).join(", ");
}
