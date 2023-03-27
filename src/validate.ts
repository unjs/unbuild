import { existsSync } from "node:fs";
import chalk from "chalk";
import { resolve } from "pathe";
import { PackageJson } from "pkg-types";
import { arrayIncludes, extractExportFilenames, getpkg, warn } from "./utils";
import { BuildContext } from "./types";

export function validateDependencies(ctx: BuildContext) {
  const usedDependencies = new Set<string>();
  const unusedDependencies = new Set<string>(
    Object.keys(ctx.pkg.dependencies || {})
  );
  const implicitDependencies = new Set<string>();
  for (const id of ctx.usedImports) {
    unusedDependencies.delete(id);
    usedDependencies.add(id);
  }
  if (Array.isArray(ctx.options.dependencies)) {
    for (const id of ctx.options.dependencies) {
      unusedDependencies.delete(id);
    }
  }
  for (const id of usedDependencies) {
    if (
      !arrayIncludes(ctx.options.externals, id) &&
      !id.startsWith("chunks/") &&
      !ctx.options.dependencies.includes(getpkg(id)) &&
      !ctx.options.peerDependencies.includes(getpkg(id))
    ) {
      implicitDependencies.add(id);
    }
  }
  if (unusedDependencies.size > 0) {
    warn(
      ctx,
      "Potential unused dependencies found: " +
        [...unusedDependencies].map((id) => chalk.cyan(id)).join(", ")
    );
  }
  if (implicitDependencies.size > 0 && !ctx.options.rollup.inlineDependencies) {
    warn(
      ctx,
      "Potential implicit dependencies found: " +
        [...implicitDependencies].map((id) => chalk.cyan(id)).join(", ")
    );
  }
}

export function validatePackage(
  pkg: PackageJson,
  rootDir: string,
  ctx: BuildContext
) {
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
    ].map((i) => i && resolve(rootDir, i.replace(/\/[^/]*\*.*$/, "")))
  );

  const missingOutputs = [];

  for (const filename of filenames) {
    if (filename && !filename.includes("*") && !existsSync(filename)) {
      missingOutputs.push(filename.replace(rootDir + "/", ""));
    }
  }
  if (missingOutputs.length > 0) {
    warn(
      ctx,
      `Potential missing package.json files: ${missingOutputs
        .map((o) => chalk.cyan(o))
        .join(", ")}`
    );
  }
}
