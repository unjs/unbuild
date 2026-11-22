import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "pathe";
import { describe, it, expect } from "vitest";
import { build } from "../src/build";

describe("declarations", () => {
  it.each([
    ["aws-lambda", "@types/aws-lambda"],
    ["@scope/service", "@types/scope__service"],
  ])(
    "preserves portable imports for %s",
    async (moduleName, typesName) => {
      const rootDir = await mkdtemp(join(tmpdir(), "unbuild-types-"));
      try {
        const typesDir = join(rootDir, "node_modules", typesName);
        await mkdir(typesDir, { recursive: true });
        await mkdir(join(rootDir, "src"));
        await writeFile(
          join(rootDir, "package.json"),
          JSON.stringify({
            name: "test-types",
            type: "module",
            devDependencies: { [typesName]: "1.0.0" },
          }),
        );
        await writeFile(
          join(typesDir, "package.json"),
          JSON.stringify({
            name: typesName,
            version: "1.0.0",
            types: "index.d.ts",
          }),
        );
        await writeFile(
          join(typesDir, "index.d.ts"),
          "export interface Context { requestId: string }",
        );
        await writeFile(
          join(rootDir, "src/index.ts"),
          `import type { Context } from "${moduleName}";
export function handler(context: Context): string { return context.requestId; }`,
        );

        await build(rootDir, false, {
          entries: ["src/index"],
          declaration: true,
          failOnWarn: false,
          rollup: { emitCJS: true },
        });

        for (const extension of ["d.ts", "d.mts", "d.cts"]) {
          const declaration = await readFile(
            join(rootDir, `dist/index.${extension}`),
            "utf8",
          );
          expect(declaration).toContain(`from '${moduleName}'`);
          expect(declaration).not.toContain(rootDir);
          expect(declaration).not.toContain("node_modules");
        }
      } finally {
        await rm(rootDir, { recursive: true, force: true });
      }
    },
    120_000,
  );
});
