import type { BuildContext } from "../src/types.ts";
import { fileURLToPath } from "node:url";
import { consola } from "consola";
import { join } from "pathe";
import { describe, it, expect } from "vitest";
import { validate } from "../src/validate";

describe("validatePackage", () => {
  it("detects missing files", () => {
    const _warnings = validate(
      [
        { usedDependencies: new Set(), implicitDependencies: new Set() },
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

  it("detects implicit deps", () => {
    const warnings = validate(
      [
        {
          usedDependencies: new Set(["unbuild", "pkg-a"]),
          implicitDependencies: new Set(["pkg-a"]),
        },
      ] as BuildContext[],
      { dependencies: { unbuild: "latest" } },
      "",
    );

    expect([...warnings][0]).to.include("implicitly bundled");
  });

  it("does not print implicit deps warning for peerDependencies", () => {
    const logs: string[] = [];
    consola.mockTypes((type) =>
      type === "warn"
        ? (str: string): void => {
            logs.push(str);
          }
        : (): void => {},
    );

    validate(
      [
        {
          usedDependencies: new Set(["unbuild", "pkg-a"]),
          implicitDependencies: new Set("pkg-a"),
        },
      ] as BuildContext[],
      {
        dependencies: { unbuild: "latest" },
        peerDependencies: { "pkg-a": "latest" },
      },
      "",
    );

    expect(logs.length).to.eq(0);
  });

  it("detects unused deps", () => {
    const warnings = validate(
      [
        {
          usedDependencies: new Set("unbuild"),
          implicitDependencies: new Set(),
        },
      ] as BuildContext[],
      { dependencies: { unbuild: "latest", "pkg-a": "latest" } },
      "",
    );

    expect([...warnings][0]).to.include("not used");
  });
});
