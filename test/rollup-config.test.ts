import { describe, it, expect } from "vitest";
import { getRollupOptions } from "../src/builders/rollup/config";
import type { BuildContext } from "../src/types";

// Create a minimal mock context for testing
function createMockContext(
  overrides: Partial<BuildContext["options"]["rollup"]> = {},
): BuildContext {
  return {
    options: {
      name: "test",
      rootDir: "/test",
      entries: [{ input: "src/index.ts", builder: "rollup", name: "index" }],
      clean: true,
      sourcemap: false,
      outDir: "dist",
      stub: false,
      watch: false,
      watchOptions: undefined,
      stubOptions: { jiti: {} },
      externals: [],
      dependencies: [],
      peerDependencies: [],
      devDependencies: [],
      alias: {},
      replace: {},
      failOnWarn: true,
      parallel: false,
      rollup: {
        emitCJS: false,
        cjsBridge: false,
        inlineDependencies: false,
        preserveDynamicImports: false,
        output: {},
        replace: { preventAssignment: true },
        alias: {},
        resolve: { preferBuiltins: true },
        json: { preferConst: true },
        commonjs: { ignoreTryCatch: true },
        esbuild: { target: "esnext" },
        dts: { respectExternal: true },
        ...overrides,
      },
    },
    pkg: { name: "test" },
    jiti: {} as any,
    buildEntries: [],
    usedImports: new Set(),
    warnings: new Set(),
    hooks: {} as any,
  };
}

describe("getRollupOptions", () => {
  it("includes pure plugin when configured", () => {
    const ctx = createMockContext({
      pure: {
        functions: ["defineComponent", "defineStore"],
      },
    });
    const options = getRollupOptions(ctx);
    const purePlugin = options.plugins.find(
      (p) => p && "name" in p && p.name === "rollup-plugin-pure",
    );
    expect(purePlugin).toBeDefined();
  });

  it("excludes pure plugin when set to false", () => {
    const ctx = createMockContext({
      pure: false,
    });
    const options = getRollupOptions(ctx);
    const purePlugin = options.plugins.find(
      (p) => p && "name" in p && p.name === "rollup-plugin-pure",
    );
    expect(purePlugin).toBeUndefined();
  });

  it("excludes pure plugin when not configured", () => {
    const ctx = createMockContext({});
    const options = getRollupOptions(ctx);
    const purePlugin = options.plugins.find(
      (p) => p && "name" in p && p.name === "rollup-plugin-pure",
    );
    expect(purePlugin).toBeUndefined();
  });
});
