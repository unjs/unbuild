import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "src/index.ts",
    {
      input: "src/plugins/",
      outDir: "dist/plugins/",
      format: "esm",
    },
    {
      input: "src/plugins/",
      outDir: "dist/plugins/",
      format: "cjs",
      ext: "cjs",
      declaration: false,
    },
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
});
