import { describe, it, expect } from "vitest";
import { rollup, type Plugin } from "rollup";
import { getRollupOptions } from "../src/builders/rollup/config";
import type { BuildContext } from "../src/types";

function getPreserveDynamicImportsPlugin(): Plugin {
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

  const plugin = getRollupOptions(ctx).plugins?.find(
    (p: any) => p && p.name === "unbuild=preserve-dynamic-imports",
  ) as Plugin | undefined;
  expect(plugin).toBeDefined();
  return plugin!;
}

async function build(
  format: "cjs" | "es",
): Promise<{ entry: string; chunk: string; chunkFileName: string }> {
  const files: Record<string, string> = {
    "\0entry": [
      `export const loadExternal = () => import("ext-pkg");`,
      `export const loadInternal = () => import("\0chunk").then((m) => m.default);`,
    ].join("\n"),
    "\0chunk": `export default 42;`,
  };
  const bundle = await rollup({
    input: "\0entry",
    external: ["ext-pkg"],
    plugins: [
      {
        name: "virtual",
        resolveId: (id): string | null => (id in files ? id : null),
        load: (id): string | undefined => files[id],
      },
      getPreserveDynamicImportsPlugin(),
    ],
  });
  const { output } = await bundle.generate({
    format,
    dynamicImportInCjs: false,
  });
  await bundle.close();
  const entry = output.find((o) => o.type === "chunk" && o.isEntry)!;
  const chunk = output.find((o) => o.type === "chunk" && !o.isEntry)!;
  return {
    entry: (entry as any).code as string,
    chunk: (chunk as any).code as string,
    chunkFileName: chunk.fileName,
  };
}

describe("preserveDynamicImports", () => {
  it("keeps import() for external modules and lets Rollup load internal chunks in CJS", async () => {
    const { entry, chunk, chunkFileName } = await build("cjs");

    expect(entry).toContain(`import('ext-pkg')`);
    expect(entry).not.toContain(`require('ext-pkg')`);
    expect(entry).toContain(`require('./${chunkFileName}')`);
    expect(entry).not.toContain(`import('./${chunkFileName}')`);

    // The internal chunk's default export is reachable through the generated loader
    const chunkExports: Record<string, unknown> = {};
    new Function("exports", chunk)(chunkExports);
    expect(chunkExports.default).toBe(42);
  });

  it("keeps import() for both external modules and internal chunks in ESM", async () => {
    const { entry, chunk, chunkFileName } = await build("es");

    expect(entry).toContain(`import('ext-pkg')`);
    expect(entry).toContain(`import('./${chunkFileName}')`);
    expect(entry).toContain(".then((m) => m.default)");
    expect(chunk).toContain("export { _chunk as default }");
  });
});
