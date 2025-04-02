import type { PackageJson } from "pkg-types";
import type { BuildContext } from "./types";
import { existsSync } from "node:fs";
import { colors } from "consola/utils";
import { resolve } from "pathe";
import { arrayIncludes, extractExportFilenames, getpkg, warn } from "./utils";

export function validateDependencies(ctx: BuildContext): void {
  for (const id of ctx.usedImports) {
    ctx.unusedDependencies.delete(id);
  }
  if (Array.isArray(ctx.options.dependencies)) {
    for (const id of ctx.options.dependencies) {
      ctx.unusedDependencies.delete(id);
    }
  }

  const implicitDependencies = new Set<string>();
  if (!ctx.options.rollup.inlineDependencies) {
    for (const id of ctx.usedImports) {
      if (
        !arrayIncludes(ctx.options.externals, id) &&
        !id.startsWith("chunks/") &&
        !ctx.options.dependencies.includes(getpkg(id)) &&
        !ctx.options.peerDependencies.includes(getpkg(id))
      ) {
        implicitDependencies.add(id);
      }
    }
  }
  if (implicitDependencies.size > 0) {
    warn(
      ctx,
      "Potential implicit dependencies found: " +
        [...implicitDependencies].map((id) => colors.cyan(id)).join(", "),
    );
  }
}

export function validatePackage(
  pkg: PackageJson,
  rootDir: string,
  ctx: BuildContext,
): void {
  if (!pkg) {
    return;
  }

  const filenames = new Set(
    [
      ...(typeof pkg.bin === "string"
        ? [pkg.bin]
        : Object.values(pkg.bin || {})),
      pkg.main,
      pkg.module,
      pkg.types,
      pkg.typings,
      ...extractExportFilenames(pkg.exports).map((i) => i.file),
    ].map((i) => i && resolve(rootDir, i.replace(/\/[^/]*\*.*$/, ""))),
  );

  for (const filename of filenames) {
    if (filename && !filename.includes("*") && !existsSync(filename)) {
      ctx.missingOutputs.add(filename.replace(rootDir + "/", ""));
    }
  }
}
