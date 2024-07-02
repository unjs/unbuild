import { transform } from "esbuild/lib/main";
import { defineBuildConfig } from "./src";

export default defineBuildConfig({
  rollup: {
    // https://github.com/unplugin/unplugin-isolated-decl
    isolatedDecl: {
      transformer: "oxc",
    },
  },
});
