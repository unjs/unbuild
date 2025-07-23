import unjs from "eslint-config-unjs";

// https://github.com/unjs/eslint-config
export default unjs({
  ignores: [
    ".git",
    "test/fixture/dist"
  ],
  rules: {
    "unicorn/no-null": 0,
    "unicorn/prevent-abbreviations": 0,
    "unicorn/prefer-module": 0,
    "unicorn/prefer-top-level-await": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "unicorn/no-named-default": 0
  },
}, {
  files: ["**/*.ts"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-inferrable-types": "error",
  }
});
