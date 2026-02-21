import { defineBuildConfig } from "../../../src/index.js";

export default defineBuildConfig({
  entries: [
    {
      input: "./src/index.ts",
      builder: "rollup",
    },
  ],
  outDir: "./dist/",
  declaration: true,
  rollup: {
    emitCJS: true,
  },
});
