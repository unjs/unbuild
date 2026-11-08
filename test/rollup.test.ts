import { describe, it, expect } from "vitest";
import { getRollupOptions } from "../src/builders/rollup/config";
import type { BuildContext } from "../src/types";

describe("preserveDynamicImports", () => {
  it("preserves external dynamic imports but delegates internal chunks to Rollup", () => {
    const ctx = {
      options: {
        rootDir: "/root",
        entries: [],
        alias: {},
        replace: {},
        rollup: {
          replace: false,
          alias: false,
          resolve: false,
          json: false,
          esbuild: false,
          commonjs: false,
          preserveDynamicImports: true,
          cjsBridge: false,
          dts: {},
        },
      },
      pkg: {},
      buildEntries: [],
      usedImports: new Set(),
      warnings: new Set(),
      hooks: {} as any,
    } as unknown as BuildContext;

    const rollupOptions = getRollupOptions(ctx);
    const plugin = rollupOptions.plugins?.find(
      (p: any) => p && p.name === "unbuild=preserve-dynamic-imports",
    ) as any;

    expect(plugin).toBeDefined();

    // External import (targetModuleId is null) should be preserved as import(...)
    expect(
      plugin.renderDynamicImport({
        targetModuleId: null,
        targetChunk: null,
      }),
    ).toEqual({ left: "import(", right: ")" });

    // Internal chunk by targetModuleId should return null so Rollup emits appropriate loader (e.g. require in CJS)
    expect(
      plugin.renderDynamicImport({
        targetModuleId: "/root/src/plugin.ts",
        targetChunk: null,
      }),
    ).toBeNull();

    // Internal chunk by targetChunk should also return null
    expect(
      plugin.renderDynamicImport({
        targetModuleId: null,
        targetChunk: { fileName: "chunks/plugin.cjs" },
      }),
    ).toBeNull();
  });
});
