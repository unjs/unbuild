import type { BuildContext } from "../src/types.ts";
import { fileURLToPath } from "node:url";
import { join } from "pathe";
import { describe, it, expect } from "vitest";
import { validateBuild, validateBuilds } from "../src/validate";

describe("validate single build", () => {
  it("detects implicit deps", () => {
    const warnings = validateBuild({
      warnings: new Set(),
      usedDependencies: new Set(["unbuild", "pkg-a"]),
      hoistedDependencies: new Set(),
      implicitDependencies: new Set(["pkg-a"]),
    } as BuildContext);

    expect([...warnings][0]).to.include("implicitly bundled");
  });

  it("does not print implicit deps warning for peerDependencies", () => {
    const warnings = validateBuild({
      warnings: new Set(),
      usedDependencies: new Set(["pkg-a"]),
      hoistedDependencies: new Set(),
      implicitDependencies: new Set(["pkg-a"]),
    } as BuildContext);

    expect([...warnings][0]).to.include("implicitly bundled");
  });

  it("detects shamefully hoisted deps", () => {
    const warnings = validateBuild({
      warnings: new Set(),
      usedDependencies: new Set(["unbuild", "pkg-a"]),
      hoistedDependencies: new Set(["pkg-a"]),
      implicitDependencies: new Set(),
    } as BuildContext);

    expect([...warnings][0]).to.include("shamefully hoisted");
  });
});

describe("validate multiple builds", () => {
  it("detects unused deps", () => {
    const warnings = validateBuilds(
      [
        {
          usedDependencies: new Set(["unbuild"]),
          hoistedDependencies: new Set(),
          implicitDependencies: new Set(),
        },
      ] as BuildContext[],
      { dependencies: { unbuild: "latest", "pkg-a": "latest" } },
      "",
    );

    expect([...warnings][0]).to.include("not used");
  });

  it("detects missing files", () => {
    const _warnings = validateBuilds(
      [
        {
          usedDependencies: new Set(),
          hoistedDependencies: new Set(),
          implicitDependencies: new Set(),
        },
      ] as BuildContext[],
      {
        main: "./dist/test",
        bin: {
          "./cli": "./dist/cli",
        },
        module: "dist/mod",
        exports: {
          "./runtime/*": "./runtime/*.mjs",
          ".": { node: "./src/index.mts" },
        },
      },
      join(fileURLToPath(import.meta.url), "../fixture"),
    );

    const warnings = [..._warnings];

    expect(warnings[0]).to.include("not generated");
    expect(warnings[0]).not.to.include("src/index.mts");

    for (const file of ["dist/test", "dist/cli", "dist/mod", "runtime"]) {
      expect(warnings[0]).to.include(file);
    }
  });
});
