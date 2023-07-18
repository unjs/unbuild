import { describe, it, expect } from "vitest";
import {
  arrayIncludes,
  extractExportFilenames,
  inferExportType,
  safetyRequireJSON,
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
    // @ts-ignore TODO: fix pkg-types
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

describe("safetyRequireJSON", () => {
  it("should not change code without require", () => {
    expect(safetyRequireJSON("const a = 1")).toBe("const a = 1");
  });

  it("should not change code without json require", () => {
    expect(safetyRequireJSON('require("./a")')).toBe('require("./a")');
  });

  it("should change code with json require", () => {
    expect(safetyRequireJSON('require("./a.json")')).toBe(
      "require(\"./a.json\")['default']"
    );
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
