import { describe, it, expect } from "vitest";
import { inferEntries, getEntrypointPaths } from "../src/auto";

describe("inferEntries", () => {
  it("recognises main and module outputs", () => {
    const result = inferEntries(
      { main: "dist/test.cjs", module: "dist/test.mjs" },
      ["src/", "src/test.ts"],
    );
    expect(result).to.deep.equal({
      cjs: true,
      dts: false,
      entries: [{ input: "src/test" }],
      warnings: [],
    });
  });

  it("handles nested indexes", () => {
    const result = inferEntries({ module: "dist/index.mjs" }, [
      "src/",
      "src/event/index.ts",
      "src/index.mts",
    ]);
    expect(result).to.deep.equal({
      cjs: false,
      dts: false,
      entries: [{ input: "src/index" }],
      warnings: [],
    });
  });

  it("handles binary outputs", () => {
    expect(
      inferEntries({ bin: "dist/cli.cjs" }, ["src/", "src/cli.ts"]),
    ).to.deep.equal({
      cjs: true,
      dts: false,
      entries: [{ input: "src/cli" }],
      warnings: [],
    });
    expect(
      inferEntries({ bin: { nuxt: "dist/cli.js" } }, ["src/", "src/cli.ts"]),
    ).to.deep.equal({
      cjs: true,
      dts: false,
      entries: [{ input: "src/cli" }],
      warnings: [],
    });
    expect(
      inferEntries({ bin: { nuxt: "dist/cli.js" }, type: "module" }, [
        "src/",
        "src/cli.ts",
      ]),
    ).to.deep.equal({
      cjs: false,
      dts: false,
      entries: [{ input: "src/cli" }],
      warnings: [],
    });
  });

  it("recognises `type: module` projects", () => {
    const result = inferEntries({ main: "dist/test.js", type: "module" }, [
      "src/",
      "src/test.ts",
    ]);
    expect(result).to.deep.equal({
      cjs: false,
      dts: false,
      entries: [{ input: "src/test" }],
      warnings: [],
    });
  });

  it("matches nested entrypoint paths", () => {
    const result = inferEntries({ exports: "dist/runtime/index.js" }, [
      "src/",
      "src/other/runtime/index.ts",
    ]);
    expect(result).to.deep.equal({
      cjs: false,
      dts: false,
      entries: [{ input: "src/other/runtime/index" }],
      warnings: [],
    });
  });

  it("handles declarations from `types`", () => {
    expect(
      inferEntries(
        { main: "dist/test.cjs", types: "custom/handwritten.d.ts" },
        ["src/", "src/test.ts"],
      ),
    ).to.deep.equal({
      cjs: true,
      dts: false,
      entries: [{ input: "src/test" }],
      warnings: ["Could not find entrypoint for `custom/handwritten.d.ts`"],
    });
    expect(
      inferEntries(
        {
          main: "dist/test.cjs",
          module: "dist/test.mjs",
          types: "dist/test.d.ts",
        },
        ["src/", "src/test.ts"],
      ),
    ).to.deep.equal({
      cjs: true,
      dts: true,
      entries: [{ input: "src/test" }],
      warnings: [],
    });
    expect(
      inferEntries(
        {
          main: "dist/test.cjs",
          module: "dist/test.mjs",
          typings: "dist/test.d.ts",
        },
        ["src/", "src/test.ts"],
      ),
    ).to.deep.equal({
      cjs: true,
      dts: true,
      entries: [{ input: "src/test" }],
      warnings: [],
    });
  });

  it("handles types within exports`", () => {
    const result = inferEntries(
      {
        // @ts-expect-error - fix pkg-types
        exports: {
          import: {
            types: "dist/test.d.mts",
            default: "dist/test.mjs",
          },
          require: {
            types: "dist/test.d.cts",
            default: "dist/test.cjs",
          },
        },
      },
      ["src/", "src/test.ts"],
    );
    expect(result).to.deep.equal({
      cjs: true,
      dts: true,
      entries: [{ input: "src/test" }],
      warnings: [],
    });
  });

  it("gracefully handles unknown entries", () => {
    expect(
      inferEntries({ exports: "dist/test.js" }, ["src/", "src/index.mts"]),
    ).to.deep.equal({
      cjs: false,
      entries: [],
      dts: false,
      warnings: ["Could not find entrypoint for `dist/test.js`"],
    });
  });

  it("ignores top-level exports", () => {
    expect(
      // @ts-expect-error - fix pkg-types
      inferEntries({ exports: { "./*": "./*" } }, [
        "src/",
        "src/",
        "src/index.mts",
      ]),
    ).to.deep.equal({
      cjs: false,
      entries: [],
      dts: false,
      warnings: [],
    });
  });

  it("handles multiple entries", () => {
    expect(
      inferEntries(
        {
          // @ts-expect-error - fix pkg-types
          exports: {
            ".": "./dist/index.cjs",
            "first-test": "./dist/first-test.cjs",
            "./test": "./dist/test.cjs",
          },
        },
        ["src/", "src/", "src/index.mts", "src/first-test.ts", "src/test.mjs"],
      ),
    ).to.deep.equal({
      cjs: true,
      dts: false,
      entries: [
        { input: "src/index" },
        { input: "src/first-test" },
        { input: "src/test" },
      ],
      warnings: [],
    });
  });

  it("recognises directory mappings", () => {
    expect(
      inferEntries({ exports: "./dist/runtime/*" }, [
        "src/",
        "src/runtime/",
        "src/runtime/test.js",
      ]),
    ).to.deep.equal({
      cjs: false,
      dts: false,
      entries: [
        { format: "esm", input: "src/runtime/", outDir: "./dist/runtime/" },
      ],
      warnings: [],
    });
    expect(
      // @ts-expect-error - fix pkg-types
      inferEntries({ exports: { "./runtime/*": "./dist/runtime/*.mjs," } }, [
        "src/",
        "src/runtime/",
      ]),
    ).to.deep.equal({
      cjs: false,
      dts: false,
      entries: [
        { format: "esm", input: "src/runtime/", outDir: "./dist/runtime/" },
      ],
      warnings: [],
    });
    expect(
      inferEntries(
        // @ts-expect-error - fix pkg-types
        { exports: { "./runtime/*": { require: "./dist/runtime/*" } } },
        ["src/", "src/runtime/"],
      ),
    ).to.deep.equal({
      cjs: true,
      dts: false,
      entries: [
        { format: "cjs", input: "src/runtime/", outDir: "./dist/runtime/" },
      ],
      warnings: [],
    });
  });
});

describe("getEntrypointPaths", () => {
  it("produces a list of possible paths", () => {
    expect(getEntrypointPaths("./dist/foo/bar.js")).to.deep.equal([
      "dist/foo/bar.js",
      "foo/bar.js",
      "bar.js",
    ]);
    expect(getEntrypointPaths("./dist/foo/")).to.deep.equal([
      "dist/foo/",
      "foo/",
    ]);
  });
});
