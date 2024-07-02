import { defineBuildConfig } from "./src";

export default defineBuildConfig({
  rollup: {
    // https://github.com/unplugin/unplugin-isolated-decl
    isolatedDecl: {},
  },
});
