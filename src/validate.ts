import type { PackageJson } from "pkg-types";
import type { BuildContext } from "./types";
import { existsSync } from "node:fs";
import { isBuiltin } from "node:module";
import { consola } from "consola";
import { colors } from "consola/utils";
import { resolvePkgEntries } from "./utils";
import { outputWarnings } from "./utils";

export function validate(
  contexts: BuildContext[],
  pkg: PackageJson,
  rootDir: string,
): void {
  const warnings = new Set<string>();
  const dependencies = new Set(Object.keys(pkg.dependencies || {}));
  const unusedDependencies = new Set(dependencies);
  const implicitDependencies = new Set<string>();

  for (const ctx of contexts) {
    for (const usedDependency of ctx.usedDependencies) {
      unusedDependencies.delete(usedDependency);

      if (
        !dependencies.has(usedDependency) &&
        !ctx.inlinedDependencies.has(usedDependency) &&
        !isBuiltin(usedDependency)
      ) {
        implicitDependencies.add(usedDependency);
      }
    }
  }

  const missingOutputs = resolvePkgEntries(pkg, rootDir)
    .filter((filename) => !existsSync(filename))
    .map((filename) => filename.replace(rootDir + "/", ""));

  if (missingOutputs.length > 0) {
    const message =
      "These files are declared in package.json but were not generated: " +
      [...missingOutputs].map((o) => colors.yellow(o)).join(", ");
    consola.debug("[unbuild] [warn]", message);
    warnings.add(message);
  }

  if (implicitDependencies.size > 0) {
    const message =
      "These dependencies are used but not listed in package.json: " +
      [...implicitDependencies].map((id) => colors.yellow(id)).join(", ");
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

  const failOnWarn = contexts.some((ctx) => ctx.options.failOnWarn);
  outputWarnings(
    "Validation is done with some warnings:",
    warnings,
    failOnWarn,
  );
}
