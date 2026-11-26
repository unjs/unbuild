import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { rewriteCrossEntryImports } from "../src/builders/mkdist/rewrite";

const tempDirs: string[] = [];

function fixture(files: Record<string, string>): {
  root: string;
  written: string[];
} {
  const root = mkdtempSync(join(tmpdir(), "unbuild-mkdist-"));
  tempDirs.push(root);
  const written = Object.keys(files).map((path) => {
    const absolute = join(root, path);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, files[path]);
    return absolute;
  });
  return { root, written };
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("rewriteCrossEntryImports", () => {
  it("resolves relative imports that point at another entry's output", async () => {
    const { root, written } = fixture({
      "dist/common/config/index.js": "export const COMMON_CONFIG = {}\n",
      "dist/runtime/fn.js":
        'import { COMMON_CONFIG } from "../common/config"\nexport const fn = () => COMMON_CONFIG\n',
    });

    await rewriteCrossEntryImports(written);

    expect(readFileSync(join(root, "dist/runtime/fn.js"), "utf8")).toContain(
      'from "../common/config/index.js"',
    );
  });

  it("rewrites require calls and leaves unknown specifiers untouched", async () => {
    const { root, written } = fixture({
      "dist/common/config/index.cjs": "exports.COMMON_CONFIG = {}\n",
      "dist/runtime/fn.cjs":
        'const { COMMON_CONFIG } = require("../common/config")\nconst missing = require("./missing")\n',
    });

    await rewriteCrossEntryImports(written);

    const code = readFileSync(join(root, "dist/runtime/fn.cjs"), "utf8");
    expect(code).toContain('require("../common/config/index.cjs")');
    expect(code).toContain('require("./missing")');
  });

  it("is idempotent", async () => {
    const { root, written } = fixture({
      "dist/common/config/index.js": "export const COMMON_CONFIG = {}\n",
      "dist/runtime/fn.js":
        'import { COMMON_CONFIG } from "../common/config"\n',
    });

    await rewriteCrossEntryImports(written);
    const once = readFileSync(join(root, "dist/runtime/fn.js"), "utf8");
    await rewriteCrossEntryImports(written);
    const twice = readFileSync(join(root, "dist/runtime/fn.js"), "utf8");

    expect(twice).toBe(once);
  });
});
