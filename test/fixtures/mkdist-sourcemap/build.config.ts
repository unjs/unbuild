import { defineBuildConfig } from "../../../src/index.js";

export default defineBuildConfig({
  entries: [
    {
      input: "./src/",
      builder: "mkdist",
    },
  ],
  outDir: "./dist/",
  sourcemap: true,
});
