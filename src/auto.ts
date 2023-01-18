import { normalize, join } from "pathe";
import consola from "consola";
import chalk from "chalk";
import type { PackageJson } from "pkg-types";
import { extractExportFilenames, listRecursively, warn } from "./utils";
import { BuildEntry, definePreset, MkdistBuildEntry } from "./types";

type InferEntriesResult = {
  entries: BuildEntry[];
  cjs?: boolean;
  dts?: boolean;
  warnings: string[];
};

export const autoPreset = definePreset(() => {
  return {
    hooks: {
      "build:prepare"(ctx) {
        // Disable auto if entries already provided of pkg not available
        if (!ctx.pkg || ctx.options.entries.length > 0) {
          return;
        }
        const sourceFiles = listRecursively(join(ctx.options.rootDir, "src"));
        const res = inferEntries(ctx.pkg, sourceFiles);
        for (const message of res.warnings) {
          warn(ctx, message);
        }
        ctx.options.entries.push(...res.entries);
        if (res.cjs) {
          ctx.options.rollup.emitCJS = true;
        }
        if (res.dts) {
          ctx.options.declaration = res.dts;
        }
        consola.info(
          "Automatically detected entries:",
          chalk.cyan(
            ctx.options.entries
              .map((e) =>
                chalk.bold(
                  e.input
                    .replace(ctx.options.rootDir + "/", "")
                    .replace(/\/$/, "/*")
                )
              )
              .join(", ")
          ),
          chalk.gray(
            ["esm", res.cjs && "cjs", res.dts && "dts"]
              .filter(Boolean)
              .map((tag) => `[${tag}]`)
              .join(" ")
          )
        );
      },
    },
  };
});

/**
 * @param {PackageJson} pkg The contents of a package.json file to serve as the source for inferred entries.
 * @param {string | string[]} source The root directory of the project.
 *   - if string, `<source>/src` will be scanned for possible source files.
 *   - if an array of source files, these will be used directly instead of accessing fs.
 */
export function inferEntries(
  pkg: PackageJson,
  sourceFiles: string[]
): InferEntriesResult {
  const warnings = [];

  // Sort files so least-nested files are first
  sourceFiles.sort((a, b) => a.split("/").length - b.split("/").length);

  // Come up with a list of all output files & their formats
  const outputs = extractExportFilenames(pkg.exports);

  if (pkg.bin) {
    const binaries =
      typeof pkg.bin === "string" ? [pkg.bin] : Object.values(pkg.bin);
    for (const file of binaries) {
      outputs.push({ file });
    }
  }
  if (pkg.main) {
    outputs.push({ file: pkg.main });
  }
  if (pkg.module) {
    outputs.push({ type: "esm", file: pkg.module });
  }
  if (pkg.types || pkg.typings) {
    outputs.push({ file: pkg.types || pkg.typings! });
  }

  // Try to detect output types
  const isESMPkg = pkg.type === "module";
  for (const output of outputs.filter((o) => !o.type)) {
    const isJS = output.file.endsWith(".js");
    if ((isESMPkg && isJS) || output.file.endsWith(".mjs")) {
      output.type = "esm";
    } else if ((!isESMPkg && isJS) || output.file.endsWith(".cjs")) {
      output.type = "cjs";
    }
  }

  let cjs = false;
  let dts = false;

  // Infer entries from package files
  const entries: BuildEntry[] = [];
  for (const output of outputs) {
    // Supported output file extensions are `.d.ts`, `.cjs` and `.mjs`
    // But we support any file extension here in case user has extended rollup options
    const outputSlug = output.file.replace(/(\*[^/\\]*|\.d\.ts|\.\w+)$/, "");
    const isDir = outputSlug.endsWith("/");

    // Skip top level directory
    if (isDir && ["./", "/"].includes(outputSlug)) {
      continue;
    }

    const possiblePaths = getEntrypointPaths(outputSlug);
    // eslint-disable-next-line unicorn/no-array-reduce
    const input = possiblePaths.reduce<string | undefined>((source, d) => {
      if (source) {
        return source;
      }
      const SOURCE_RE = new RegExp(`${d}${isDir ? "" : "\\.\\w+"}$`);
      return sourceFiles
        .find((i) => i.match(SOURCE_RE))
        ?.replace(/(\.d\.ts|\.\w+)$/, "");
    }, undefined as any);

    if (!input) {
      warnings.push(`Could not find entrypoint for ${output.file}`);
      continue;
    }

    if (output.type === "cjs") {
      cjs = true;
    }

    const entry =
      entries.find((i) => i.input === input) ||
      entries[entries.push({ input }) - 1];

    if (output.file.endsWith(".d.ts")) {
      dts = true;
    }

    if (isDir) {
      entry.outDir = outputSlug;
      (entry as MkdistBuildEntry).format = output.type;
    }
  }

  return { entries, cjs, dts, warnings };
}

export const getEntrypointPaths = (path: string) => {
  const segments = normalize(path).split("/");
  return segments
    .map((_, index) => segments.slice(index).join("/"))
    .filter(Boolean);
};
