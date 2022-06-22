# unbuild

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]

> A unified javascript build system

**📦 Optimized bundler**

Robust [rollup](https://rollupjs.org) based bundler that supports typescript and generates commonjs and module formats + type declarations.

**📁 Bundleless build**

Integration with [mkdist](https://github.com/unjs/mkdist) for generating bundleless dists with file-to-file transpilation.

**✨ Passive watcher**

Stub `dist` once using  [jiti](https://github.com/unjs/jiti) and you can try and link your project without needing to watch and rebuild during development.

**✍ Untype Generator**

Integration with [untyped](https://github.com/unjs/untyped).

**✔️ Build Validator**

Automatically check for potential **missing** and **unused** [dependencies](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#dependencies). Also you can check output size and exports quickly in CLI output.

## Usage

Create `src/index.ts` and `build.config.ts`:

```ts
export default {
  entries: [
    './src/index'
  ]
}
```

```sh
npx unbuild
```

## Configuration

You can either use `unbuild` key in `package.json` or `build.config.{js,ts,json}` to specify configuration.

See options [here](./src/types.ts).

Example:

```ts
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    // If entries is not provided, will be automatically inferred from package.json 
    entries: [
        // default
        './src/index',
        // mkdist builder transpiles file-to-file keeping original sources structure
        {
            builder: 'mkdist',
            input: './src/package/components/',
            outDir: './build/components'
        },
    ],

    // Change outDir, default is 'dist'
    outDir: 'build',

    // Generates .d.ts declaration file
    declaration: true,
})
```

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## License

[MIT](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/unbuild?style=flat-square
[npm-version-href]: https://npmjs.com/package/unbuild

[npm-downloads-src]: https://img.shields.io/npm/dm/unbuild?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/unbuild

[github-actions-src]: https://img.shields.io/github/workflow/status/unjs/unbuild/ci/main?style=flat-square
[github-actions-href]: https://github.com/unjs/unbuild/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/unbuild/main?style=flat-square
[codecov-href]: https://codecov.io/gh/unjs/unbuild
