import fsp from "node:fs/promises";
import { readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "pathe";
import { createJiti } from "jiti";
import { consola } from "consola";
import type { PackageJson } from "pkg-types";
import { autoPreset } from "./auto";
import type { BuildPreset, BuildConfig, BuildContext } from "./types";

export async function ensuredir(path: string): Promise<void> {
  await fsp.mkdir(dirname(path), { recursive: true });
}

export function warn(ctx: BuildContext, message: string): void {
  if (ctx.warnings.has(message)) {
    return;
  }
  consola.debug("[unbuild] [warn]", message);
  ctx.warnings.add(message);
}

export async function symlink(
  from: string,
  to: string,
  force = true,
): Promise<void> {
  await ensuredir(to);
  if (force) {
    await fsp.unlink(to).catch(() => {});
  }
  await fsp.symlink(from, to, "junction");
}

export function dumpObject(obj: Record<string, any>): string {
  return (
    "{ " +
    Object.keys(obj)
      .map((key) => `${key}: ${JSON.stringify(obj[key])}`)
      .join(", ") +
    " }"
  );
}

export function getpkg(id = ""): string {
  const s = id.split("/");
  return s[0][0] === "@" ? `${s[0]}/${s[1]}` : s[0];
}

export async function rmdir(dir: string): Promise<void> {
  await fsp.unlink(dir).catch(() => {});
  await fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
}

export function listRecursively(path: string): string[] {
  const filenames = new Set<string>();
  const walk = (path: string): void => {
    const files = readdirSync(path);
    for (const file of files) {
      const fullPath = resolve(path, file);
      if (statSync(fullPath).isDirectory()) {
        filenames.add(fullPath + "/");
        walk(fullPath);
      } else {
        filenames.add(fullPath);
      }
    }
  };
  walk(path);
  return [...filenames];
}

export async function resolvePreset(
  preset: string | BuildPreset,
  rootDir: string,
): Promise<BuildConfig> {
  if (preset === "auto") {
    preset = autoPreset;
  } else if (typeof preset === "string") {
    preset =
      (await createJiti(rootDir, { interopDefault: true }).import(preset, {
        default: true,
      })) || {};
  }
  if (typeof preset === "function") {
    preset = preset();
  }
  return preset as BuildConfig;
}

export function inferExportType(
  condition: string,
  previousConditions: string[] = [],
  filename = "",
): "esm" | "cjs" {
  if (filename) {
    if (filename.endsWith(".d.ts")) {
      return "esm";
    }
    if (filename.endsWith(".mjs")) {
      return "esm";
    }
    if (filename.endsWith(".cjs")) {
      return "cjs";
    }
  }
  switch (condition) {
    case "import": {
      return "esm";
    }
    case "require": {
      return "cjs";
    }
    default: {
      if (previousConditions.length === 0) {
        // TODO: Check against type:module for default
        return "esm";
      }
      const [newCondition, ...rest] = previousConditions;
      return inferExportType(newCondition, rest, filename);
    }
  }
}

export type OutputDescriptor = { file: string; type?: "esm" | "cjs" };

export function extractExportFilenames(
  exports: PackageJson["exports"],
  conditions: string[] = [],
): OutputDescriptor[] {
  if (!exports) {
    return [];
  }
  if (typeof exports === "string") {
    return [{ file: exports, type: "esm" }];
  }
  return (
    Object.entries(exports)
      // Filter out .json subpaths such as package.json
      .filter(([subpath]) => !subpath.endsWith(".json"))
      .flatMap(([condition, exports]) =>
        typeof exports === "string"
          ? {
              file: exports,
              type: inferExportType(condition, conditions, exports),
            }
          : extractExportFilenames(exports, [...conditions, condition]),
      )
  );
}

export function arrayIncludes(
  arr: (string | RegExp)[],
  searchElement: string,
): boolean {
  return arr.some((entry) =>
    entry instanceof RegExp
      ? entry.test(searchElement)
      : entry === searchElement,
  );
}

export function removeExtension(filename: string): string {
  return filename.replace(/\.(js|mjs|cjs|ts|mts|cts|json|jsx|tsx)$/, "");
}

export function inferPkgExternals(pkg: PackageJson): (string | RegExp)[] {
  const externals: (string | RegExp)[] = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.devDependencies || {}).filter((dep) =>
      dep.startsWith("@types/"),
    ),
    ...Object.keys(pkg.optionalDependencies || {}),
  ];

  if (pkg.name) {
    externals.push(pkg.name);
    if (pkg.exports) {
      for (const subpath of Object.keys(pkg.exports)) {
        if (subpath.startsWith("./")) {
          externals.push(pathToRegex(`${pkg.name}/${subpath.slice(2)}`));
        }
      }
    }
  }

  if (pkg.imports) {
    for (const importName of Object.keys(pkg.imports)) {
      if (importName.startsWith("#")) {
        externals.push(pathToRegex(importName));
      }
    }
  }

  return [...new Set(externals)];
}

function pathToRegex(path: string): string | RegExp {
  return path.includes("*")
    ? new RegExp(
        `^${path.replace(/\./g, String.raw`\.`).replace(/\*/g, ".*")}$`,
      )
    : path;
}

export function withTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}
