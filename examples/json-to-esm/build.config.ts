import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    {
      input: "src/data.json",
    },
  ],
  rollup: {
    output: {
      exports: "named",
    },
  },
});
