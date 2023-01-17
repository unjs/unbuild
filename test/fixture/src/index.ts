import { arch } from "node:os";
import testJSON from "./test.json";

console.log("__filename", __filename);
console.log("__dirname", __dirname);
console.log("import.meta.url", import.meta.url);

console.log(arch());
console.log(require("node:os").arch());
console.log(require.resolve("rollup"));
console.log(testJSON);
import("node:os").then((os) => console.log(os.arch()));

// @ts-ignore
import("./runtime/foo.ts").then(console.log);

export const foo = "bar";
export const baz = "123";
export default "default";

// Failing test
// export * from 'defu'
