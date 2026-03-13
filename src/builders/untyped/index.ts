import { writeFile } from "node:fs/promises";
import { resolve } from "pathe";
import { resolveSchema, generateTypes, generateMarkdown } from "untyped";
import { loadSchema } from "untyped/loader";
import { pascalCase } from "scule";
import type {
  BuildContext,
  UntypedBuildEntry,
  UntypedOutputs,
} from "../../types";
import consola from "consola";

export async function typesBuild(ctx: BuildContext): Promise<void> {
  const entries = ctx.options.entries.filter(
    (entry) => entry.builder === "untyped",
  ) as UntypedBuildEntry[];
  await ctx.hooks.callHook("untyped:entries", ctx, entries);

  for (const entry of entries) {
    const options = { jiti: {} };
    await ctx.hooks.callHook("untyped:entry:options", ctx, entry, options);

    const defaults = entry.defaults || {};
    const schema = await loadSchema(resolve(ctx.options.rootDir, entry.input), {
      cwd: ctx.options.rootDir,
      jiti: options.jiti,
      defaults,
    }).catch(() => resolveSchema({}, defaults));

    await ctx.hooks.callHook("untyped:entry:schema", ctx, entry, schema);

    const distDir = entry.outDir!;
    const outputs: UntypedOutputs = {
      markdown: {
        fileName: resolve(distDir, `${entry.name}.md`),
        contents: generateMarkdown(schema),
      },
      schema: {
        fileName: `${entry.name}.schema.json`,
        contents: JSON.stringify(schema, null, 2),
      },
      defaults: {
        fileName: `${entry.name}.defaults.json`,
        contents: JSON.stringify(defaults, null, 2),
      },
      declaration: entry.declaration
        ? {
            fileName: `${entry.name}.d.ts`,
            contents: generateTypes(schema, {
              interfaceName: pascalCase(entry.name + "-schema"),
            }),
          }
        : undefined,
    };
    await ctx.hooks.callHook("untyped:entry:outputs", ctx, entry, outputs);
    for (const output of Object.values(outputs)) {
      if (!output) continue; // declaration is optional
      await writeFile(
        resolve(distDir, output.fileName),
        output.contents,
        "utf8",
      );
    }
  }
  await ctx.hooks.callHook("untyped:done", ctx);

  if (entries.length > 0 && ctx.options.watch) {
    consola.warn("`untyped` builder does not support watch mode yet.");
  }
}
