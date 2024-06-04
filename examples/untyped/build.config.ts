import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "src/index.ts",
    {
      builder: "untyped",
      input: "src/index.ts",
      outDir: "docs",
      name: "examples",
    },
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
});
