import { describe, it, expect } from "vitest";
import {
  arrayIncludes,
  extractExportFilenames,
  inferExportType,
  inferPkgExternals,
} from "../src/utils";

describe("inferExportType", () => {
  it("infers export type by condition", () => {
    expect(inferExportType("import")).to.equal("esm");
    expect(inferExportType("require")).to.equal("cjs");
    expect(inferExportType("node")).to.equal("esm");
    expect(inferExportType("some_unknown_condition")).to.equal("esm");
  });
  it("infers export type based on previous conditions", () => {
    expect(inferExportType("import", ["require"])).to.equal("esm");
    expect(inferExportType("node", ["require"])).to.equal("cjs");
    expect(inferExportType("node", ["import"])).to.equal("esm");
    expect(inferExportType("node", ["unknown", "require"])).to.equal("cjs");
  });
});

describe("extractExportFilenames", () => {
  it("handles strings", () => {
    expect(extractExportFilenames("test")).to.deep.equal([
      { file: "test", type: "esm" },
    ]);
  });
  it("handles nested objects", () => {
    expect(extractExportFilenames({ require: "test" })).to.deep.equal([
      { file: "test", type: "cjs" },
    ]);
    expect(
      extractExportFilenames({
        require: { node: "test", other: { import: "this", require: "that" } },
      }),
    ).to.deep.equal([
      { file: "test", type: "cjs" },
      { file: "this", type: "esm" },
      { file: "that", type: "cjs" },
    ]);
  });
});

describe("arrayIncludes", () => {
  it("handles strings", () => {
    expect(arrayIncludes(["test1", "test2"], "test1")).to.eq(true);
    expect(arrayIncludes(["test1", "test2"], "test3")).to.eq(false);
  });
  it("handles regular expressions", () => {
    expect(arrayIncludes([/t1$/, "test2"], "test1")).to.eq(true);
    expect(arrayIncludes([/t3$/, "test2"], "test1")).to.eq(false);
  });
});

describe("inferPkgExternals", () => {
  it("infers externals from package.json", () => {
    expect(
      inferPkgExternals({
        name: "test",
        dependencies: { react: "17.0.0" },
        peerDependencies: { "react-dom": "17.0.0" },
        devDependencies: { "@types/react": "17.0.0", webpack: "*" },
        optionalDependencies: { test: "1.0.0", optional: "1.0.0" },
        exports: {
          ".": "index.js",
          "./extra/utils": "utils.js",
          "./drivers/*.js": "drivers/*.js",
          invalid: "invalid.js",
        },
        imports: {
          "#*": "src/*",
          "#test": "test.js",
          invalid: "invalid.js",
        },
      }),
    ).to.deep.equal([
      "react",
      "react-dom",
      "@types/react",
      "test",
      "optional",
      "test/extra/utils",
      /^test\/drivers\/.*\.js$/,
      /^#.*$/,
      "#test",
    ]);
  });
});
