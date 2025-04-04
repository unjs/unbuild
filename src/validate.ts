import type { PackageJson } from "pkg-types";
import type { BuildContext } from "./types";
import { existsSync } from "node:fs";
import { consola } from "consola";
import { colors } from "consola/utils";
import { resolvePkgEntries } from "./utils";

export function validate(
  contexts: BuildContext[],
  pkg: PackageJson,
  rootDir: string,
): Set<string> {
  const dependencies = Object.keys(pkg.dependencies || {});
  const unusedDependencies = new Set(dependencies);
  const implicitDependencies = new Set<string>();

  for (const ctx of contexts) {
    for (const id of ctx.usedDependencies) {
      unusedDependencies.delete(id);
    }
    for (const id of ctx.implicitDependencies) {
      implicitDependencies.add(id);
    }
  }

  const warnings = new Set<string>();
  const missingOutputs = resolvePkgEntries(pkg, rootDir)
    .filter((entry) => !existsSync(entry.filename))
    .map((entry) => entry.raw);

  if (missingOutputs.length > 0) {
    const message =
      "These files are declared in package.json but not generated: " +
      [...missingOutputs].map((o) => colors.yellow(o)).join(", ");
    consola.debug("[unbuild] [warn]", message);
    warnings.add(message);
  }

  if (unusedDependencies.size > 0) {
    const message =
      "These dependencies are listed in package.json but not used: " +
      [...unusedDependencies].map((id) => colors.yellow(id)).join(", ");
    consola.debug("[unbuild] [warn]", message);
    warnings.add(message);
  }

  if (implicitDependencies.size > 0) {
    const message =
      "These dependencies are implicitly bundled: " +
      [...implicitDependencies].map((id) => colors.yellow(id)).join(", ");
    consola.debug("[unbuild] [warn]", message);
    warnings.add(message);
  }

  return warnings;
}
