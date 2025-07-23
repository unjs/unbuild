# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## v3.6.0

[compare changes](https://github.com/unjs/unbuild/compare/v3.5.0...v3.6.0)

### 🚀 Enhancements

- Support `absoluteJitiPath` for stub mode ([#542](https://github.com/unjs/unbuild/pull/542))

### 🩹 Fixes

- **types:** Improve type safety ([#516](https://github.com/unjs/unbuild/pull/516))

### 📖 Documentation

- Remove wrong jsdoc for `dts` type ([#540](https://github.com/unjs/unbuild/pull/540))

### 🏡 Chore

- Add note about obuild ([a751e3b](https://github.com/unjs/unbuild/commit/a751e3b))
- Update deps ([2951dfd](https://github.com/unjs/unbuild/commit/2951dfd))
- Update eslint config ([66b9604](https://github.com/unjs/unbuild/commit/66b9604))

### ✅ Tests

- Only include src for coverage report ([#525](https://github.com/unjs/unbuild/pull/525))

### ❤️ Contributors

- Kanon ([@ysknsid25](https://github.com/ysknsid25))
- Pooya Parsa ([@pi0](https://github.com/pi0))
- Bobbie Goede <bobbiegoede@gmail.com>
- Kricsleo ([@kricsleo](https://github.com/kricsleo))
- Daniel Roe ([@danielroe](https://github.com/danielroe))

## v3.5.0

[compare changes](https://github.com/unjs/unbuild/compare/v3.4.1...v3.5.0)

### 🚀 Enhancements

- Use `fix-dts-default-cjs-exports` to transform cjs types ([#513](https://github.com/unjs/unbuild/pull/513))

### 🏡 Chore

- **release:** V3.4.1 ([b408ac0](https://github.com/unjs/unbuild/commit/b408ac0))
- Updated untyped to v2 ([24997cc](https://github.com/unjs/unbuild/commit/24997cc))
- **release:** V3.4.2 ([045ebf2](https://github.com/unjs/unbuild/commit/045ebf2))

### ❤️ Contributors

- Joaquín Sánchez ([@userquin](https://github.com/userquin))
- Pooya Parsa ([@pi0](https://github.com/pi0))

## v3.4.2

[compare changes](https://github.com/unjs/unbuild/compare/v3.4.1...v3.4.2)

### 🏡 Chore

- Updated untyped to v2 ([24997cc](https://github.com/unjs/unbuild/commit/24997cc))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))

## v3.4.1

[compare changes](https://github.com/unjs/unbuild/compare/v3.4.0...v3.4.1)

### 🩹 Fixes

- Filter commonjs plugin when generating declaration ([#495](https://github.com/unjs/unbuild/pull/495))

### ❤️ Contributors

- Kricsleo ([@kricsleo](https://github.com/kricsleo))

## v3.4.0

[compare changes](https://github.com/unjs/unbuild/compare/v3.3.1...v3.4.0)

### 🚀 Enhancements

- Prefer `publishConfig` from `package.json` when defined ([#506](https://github.com/unjs/unbuild/pull/506))

### 🩹 Fixes

- Workaroud the `composite` in `tsconfig.json` ([#504](https://github.com/unjs/unbuild/pull/504))

### 📦 Build

- Remove extra dist files ([c0c00ad](https://github.com/unjs/unbuild/commit/c0c00ad))

### 🏡 Chore

- Update deps ([60154b1](https://github.com/unjs/unbuild/commit/60154b1))
- Update dependencies ([2448af1](https://github.com/unjs/unbuild/commit/2448af1))
- Update pnpm ([b43bdf1](https://github.com/unjs/unbuild/commit/b43bdf1))
- Update `JavaScript` case in pkg description ([#493](https://github.com/unjs/unbuild/pull/493))
- Update exports field ([0b0d90c](https://github.com/unjs/unbuild/commit/0b0d90c))
- Update build config ([61054fe](https://github.com/unjs/unbuild/commit/61054fe))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))
- Kricsleo ([@kricsleo](https://github.com/kricsleo))
- @beer ([@iiio2](https://github.com/iiio2))

## v3.3.1

[compare changes](https://github.com/unjs/unbuild/compare/v3.3.0...v3.3.1)

### 🩹 Fixes

- **rollup:** Improve external detection ([#488](https://github.com/unjs/unbuild/pull/488))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v3.3.0

[compare changes](https://github.com/unjs/unbuild/compare/v3.2.0...v3.3.0)

### 🚀 Enhancements

- Allow specifying dependencies to inline in `inlineDependencies` ([#480](https://github.com/unjs/unbuild/pull/480))

### 🩹 Fixes

- **rollup:** Resolve aliases using pathe utils ([#483](https://github.com/unjs/unbuild/pull/483))

### 💅 Refactors

- Inline `withTrailingSlash` util ([#482](https://github.com/unjs/unbuild/pull/482))

### 🏡 Chore

- Update deps ([edc8784](https://github.com/unjs/unbuild/commit/edc8784))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Kricsleo ([@kricsleo](http://github.com/kricsleo))
- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v3.2.0

[compare changes](https://github.com/unjs/unbuild/compare/v3.1.0...v3.2.0)

### 🚀 Enhancements

- **mkdist:** Fail build if `mkdist` errors in creating declarations ([#473](https://github.com/unjs/unbuild/pull/473))

### 🩹 Fixes

- Correct `.d.cts` default export type ([#458](https://github.com/unjs/unbuild/pull/458))

### 🏡 Chore

- Update deps ([4536320](https://github.com/unjs/unbuild/commit/4536320))

### ❤️ Contributors

- Kricsleo ([@kricsleo](http://github.com/kricsleo))
- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Pooya Parsa ([@pi0](http://github.com/pi0))

## v3.1.0

[compare changes](https://github.com/unjs/unbuild/compare/v3.0.1...v3.1.0)

### 🚀 Enhancements

- Support parallel builds ([af19b1b](https://github.com/unjs/unbuild/commit/af19b1b))
- Infer externals from package `name`, `exports` and `imports` ([#469](https://github.com/unjs/unbuild/pull/469))
- **rollup:** Resolve with `production` condition ([#470](https://github.com/unjs/unbuild/pull/470))

### 🩹 Fixes

- Resolve preset on directory ([#465](https://github.com/unjs/unbuild/pull/465))
- Only externalize `@types/` from `devDependencies` ([#471](https://github.com/unjs/unbuild/pull/471))

### 🏡 Chore

- Remove unused imports ([#463](https://github.com/unjs/unbuild/pull/463))
- Apply automated updates ([f724382](https://github.com/unjs/unbuild/commit/f724382))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Sunny-117 <zhiqiangfu6@gmail.com>
- Christian Preston ([@cpreston321](http://github.com/cpreston321))
- Sunny ([@Sunny-117](http://github.com/Sunny-117))

## v3.0.1

[compare changes](https://github.com/unjs/unbuild/compare/v3.0.0...v3.0.1)

### 🩹 Fixes

- **rollup:** De-default default export from stub ([#455](https://github.com/unjs/unbuild/pull/455))

### 🏡 Chore

- Update changeloge.md ([577b841](https://github.com/unjs/unbuild/commit/577b841))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Pooya Parsa ([@pi0](http://github.com/pi0))

## v3.0.0

See [github release notes](https://github.com/unjs/unbuild/releases/edit/v3.0.0).

## v3.0.0-rc.11

[compare changes](https://github.com/unjs/unbuild/compare/v3.0.0-rc.10...v3.0.0-rc.11)

### 🩹 Fixes

- **untyped:** Use schema module default export if is the only export ([cc26726](https://github.com/unjs/unbuild/commit/cc26726))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v3.0.0-rc.10

[compare changes](https://github.com/unjs/unbuild/compare/v3.0.0-rc.9...v3.0.0-rc.10)

### 🚀 Enhancements

- Add `--config` to the CLI ([#440](https://github.com/unjs/unbuild/pull/440))

### 🩹 Fixes

- Update to jiti 2.3 ([9147c3e](https://github.com/unjs/unbuild/commit/9147c3e))
- Untyped declaration output is optional ([5820182](https://github.com/unjs/unbuild/commit/5820182))

### 📖 Documentation

- Add more usage info ([#401](https://github.com/unjs/unbuild/pull/401))

### 🏡 Chore

- Update deps ([c5e0b89](https://github.com/unjs/unbuild/commit/c5e0b89))
- Remove extra default check ([b380758](https://github.com/unjs/unbuild/commit/b380758))
- Enable automd ([2ea153a](https://github.com/unjs/unbuild/commit/2ea153a))
- Update mkdist ([877906f](https://github.com/unjs/unbuild/commit/877906f))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- 阿菜 Cai <1064425721@qq.com>
- Joaquín Sánchez ([@userquin](http://github.com/userquin))

## v3.0.0-rc.9

[compare changes](https://github.com/unjs/unbuild/compare/v3.0.0-rc.8...v3.0.0-rc.9)

### 🩹 Fixes

- **stub:** Enable `interopDefault` by default ([8e6f7e4](https://github.com/unjs/unbuild/commit/8e6f7e4))
- **config:** Only take default export ([fefafec](https://github.com/unjs/unbuild/commit/fefafec))

### 🏡 Chore

- Remove unused dep ([1a65aef](https://github.com/unjs/unbuild/commit/1a65aef))
- Update dependencies ([f7ab6ce](https://github.com/unjs/unbuild/commit/f7ab6ce))
- Lint ([262a35a](https://github.com/unjs/unbuild/commit/262a35a))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v3.0.0-rc.8

[compare changes](https://github.com/unjs/unbuild/compare/v3.0.0-rc.7...v3.0.0-rc.8)

### 🩹 Fixes

- Normalize resolved path ([2640083](https://github.com/unjs/unbuild/commit/2640083))

### 💅 Refactors

- Replace fast-glob with tinyglobby ([#426](https://github.com/unjs/unbuild/pull/426))

### 📖 Documentation

- Fix tiny typo ([#414](https://github.com/unjs/unbuild/pull/414))

### 🏡 Chore

- Update dependencies ([2f815ef](https://github.com/unjs/unbuild/commit/2f815ef))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Superchupu ([@SuperchupuDev](http://github.com/SuperchupuDev))
- @beer ([@iiio2](http://github.com/iiio2))

## v3.0.0-rc.7

[compare changes](https://github.com/unjs/unbuild/compare/v3.0.0-rc.6...v3.0.0-rc.7)

### 💅 Refactors

- Replace `globby` w/ `fast-glob` ([#418](https://github.com/unjs/unbuild/pull/418))

### 🏡 Chore

- Removed resolved @ts-expect-error ([733a914](https://github.com/unjs/unbuild/commit/733a914))
- Update deps ([6e3be15](https://github.com/unjs/unbuild/commit/6e3be15))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Sukka <isukkaw@gmail.com>

## v3.0.0-rc.6

[compare changes](https://github.com/unjs/unbuild/compare/v3.0.0-rc.5...v3.0.0-rc.6)

### 🩹 Fixes

- **untyped:** Use custom jiti instance ([00ded57](https://github.com/unjs/unbuild/commit/00ded57))

### 🏡 Chore

- Eslint ignore `test/fixture/dist` ([66a8db3](https://github.com/unjs/unbuild/commit/66a8db3))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v3.0.0-rc.5

[compare changes](https://github.com/unjs/unbuild/compare/v3.0.0-rc.4...v3.0.0-rc.5)

### 🩹 Fixes

- **rollup:** Keep empty type-only modules ([7a6469b](https://github.com/unjs/unbuild/commit/7a6469b))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v3.0.0-rc.4

[compare changes](https://github.com/unjs/unbuild/compare/v3.0.0-rc.3...v3.0.0-rc.4)

### 🩹 Fixes

- **rollup:** Keep empty (type-only) modules ([a9158e2](https://github.com/unjs/unbuild/commit/a9158e2))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v3.0.0-rc.3

[compare changes](https://github.com/unjs/unbuild/compare/v3.0.0-rc.2...v3.0.0-rc.3)

### 🚀 Enhancements

- Upgrade to jiti v2 beta ([#409](https://github.com/unjs/unbuild/pull/409))

### 🩹 Fixes

- Type `RollupOptions.plugins` as array ([62fa930](https://github.com/unjs/unbuild/commit/62fa930))
- Add all loader extensions to esbuild include ([8ab22ff](https://github.com/unjs/unbuild/commit/8ab22ff))
- Enable jiti `interopDefault` for config loader and internals (ref: #409) ([#409](https://github.com/unjs/unbuild/issues/409))

### 💅 Refactors

- Overhaul builders structure ([#410](https://github.com/unjs/unbuild/pull/410))
- Add explicit return types ([#412](https://github.com/unjs/unbuild/pull/412))
- Use `colors` from `consola/utils` ([6a8f36d](https://github.com/unjs/unbuild/commit/6a8f36d))

### 🏡 Chore

- Upgrade `@rollup/plugin-commonjs` to 26 ([9392ec3](https://github.com/unjs/unbuild/commit/9392ec3))
- Update deps ([d886ad5](https://github.com/unjs/unbuild/commit/d886ad5))
- Update release script ([8ce4090](https://github.com/unjs/unbuild/commit/8ce4090))
- Remove unused imports ([04c2b5c](https://github.com/unjs/unbuild/commit/04c2b5c))
- Add explicit type for var exports ([af26e40](https://github.com/unjs/unbuild/commit/af26e40))
- Stricter type checks ([#413](https://github.com/unjs/unbuild/pull/413))
- Add publishTag to release script ([577484c](https://github.com/unjs/unbuild/commit/577484c))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v3.0.0-rc.2

[compare changes](https://github.com/unjs/unbuild/compare/v3.0.0-rc.1...v3.0.0-rc.2)

### 🚀 Enhancements

- Support `copy` builder ([#389](https://github.com/unjs/unbuild/pull/389))
- Experimental active watcher for rollup ([#364](https://github.com/unjs/unbuild/pull/364))
- **rollup:** Add `.mts` and `.cts` to supported extensions ([633ffe9](https://github.com/unjs/unbuild/commit/633ffe9))
- Support custom jiti plugins for stub mode ([#368](https://github.com/unjs/unbuild/pull/368))

### 🩹 Fixes

- Generate stub types of with explicit extension import if pkg type is `module` ([#371](https://github.com/unjs/unbuild/pull/371))
- Correct dts generation for stub mode ([#314](https://github.com/unjs/unbuild/pull/314))
- **rollup:** Handle aliases when checking for externals ([#384](https://github.com/unjs/unbuild/pull/384))
- **rollup:** Update `importAttributesKey` to `with` ([27bcba8](https://github.com/unjs/unbuild/commit/27bcba8))

### 📖 Documentation

- Add more jsdocs ([#363](https://github.com/unjs/unbuild/pull/363))
- Add examples ([#334](https://github.com/unjs/unbuild/pull/334))

### 🏡 Chore

- **release:** V3.0.0-rc.1 ([0419efa](https://github.com/unjs/unbuild/commit/0419efa))
- Update prerelease script ([94615cf](https://github.com/unjs/unbuild/commit/94615cf))
- Fix typo in comments ([#393](https://github.com/unjs/unbuild/pull/393))
- Update eslint to v9 ([f085607](https://github.com/unjs/unbuild/commit/f085607))
- Update dependencies ([5de86d7](https://github.com/unjs/unbuild/commit/5de86d7))
- Apply automated lint fixes ([225338e](https://github.com/unjs/unbuild/commit/225338e))
- Update ci ([8b39cfd](https://github.com/unjs/unbuild/commit/8b39cfd))

### 🤖 CI

- Test against node v18 ([7bc5321](https://github.com/unjs/unbuild/commit/7bc5321))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- S3xysteak ([@s3xysteak](http://github.com/s3xysteak))
- Weng <157215725@qq.com>
- ZHAO Jin-Xiang <xiaoxiangmoe@gmail.com>
- Joe McKenney ([@joemckenney](http://github.com/joemckenney))
- Estéban <e.soubiran25@gmail.com>
- Yasuhiro SHIMIZU <the.phantom.bane@gmail.com>
- 阿菜 Cai <1064425721@qq.com>
- Marco Solazzi <marco.solazzi@gmail.com>
- Shoma-mano ([@shoma-mano](http://github.com/shoma-mano))
- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v3.0.0-rc.1

[compare changes](https://github.com/unjs/unbuild/compare/v2.0.0...v3.0.0-rc.1)

### 🚀 Enhancements

- ⚠️ Upgrade to rollup v4 ([#327](https://github.com/unjs/unbuild/pull/327))
- Support disabling `preserveDynamicImports` ([#322](https://github.com/unjs/unbuild/pull/322))
- **rollup:** ⚠️ Default to `esnext` build target ([#335](https://github.com/unjs/unbuild/pull/335))

### 🩹 Fixes

- Don't clean root directory if set as `outDir` ([#343](https://github.com/unjs/unbuild/pull/343))

### 💅 Refactors

- Use `jiti.import` for esm stubs and improve templates ([#300](https://github.com/unjs/unbuild/pull/300))

### 📖 Documentation

- Update jsdocs for `inferEntries` ([#310](https://github.com/unjs/unbuild/pull/310))

### 🏡 Chore

- Update dependencies ([83ea4f0](https://github.com/unjs/unbuild/commit/83ea4f0))
- Update dependencies ([4d69ebe](https://github.com/unjs/unbuild/commit/4d69ebe))
- Add prerelease script ([9c48ca4](https://github.com/unjs/unbuild/commit/9c48ca4))

#### ⚠️ Breaking Changes

- ⚠️ Upgrade to rollup v4 ([#327](https://github.com/unjs/unbuild/pull/327))
- **rollup:** ⚠️ Default to `esnext` build target ([#335](https://github.com/unjs/unbuild/pull/335))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Daniel Roe <daniel@roe.dev>
- Anthony Fu <anthonyfu117@hotmail.com>
- Brendon Matos <brendonferreiradm@gmail.com>
- Estéban ([@Barbapapazes](http://github.com/Barbapapazes))
- 翠 / Green <green@sapphi.red>

## v2.0.0

[compare changes](https://github.com/unjs/unbuild/compare/v2.0.0-rc.0...v2.0.0)

### 🏡 Chore

- Update dependencies ([33b20a4](https://github.com/unjs/unbuild/commit/33b20a4))
- Update depedencies ([8d8a3d7](https://github.com/unjs/unbuild/commit/8d8a3d7))

### 🤖 CI

- Use conventional commit for autofix ([#294](https://github.com/unjs/unbuild/pull/294))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Daniel Roe <daniel@roe.dev>

## v2.0.0-rc.0

[compare changes](https://github.com/unjs/unbuild/compare/v1.2.1...v2.0.0-rc.0)

### 🚀 Enhancements

- Generate `.d.mts` and `.d.cts` declarations ([#273](https://github.com/unjs/unbuild/pull/273))
- Support multiple build configs ([#275](https://github.com/unjs/unbuild/pull/275))
- Support nested subpaths ([#280](https://github.com/unjs/unbuild/pull/280))
- Allow customizing jiti options for stub entries ([#282](https://github.com/unjs/unbuild/pull/282))
- Support aliases for stub mode ([#283](https://github.com/unjs/unbuild/pull/283))
- Migrate to `unjs/citty` ([#284](https://github.com/unjs/unbuild/pull/284))
- **cli:** Support `--minify` ([#285](https://github.com/unjs/unbuild/pull/285))
- Sourcemap support ([#286](https://github.com/unjs/unbuild/pull/286))

### 🩹 Fixes

- Respect directory separator when matching entries ([#214](https://github.com/unjs/unbuild/pull/214))
- **esbuild:** Typo in `sourcemap` option ([#259](https://github.com/unjs/unbuild/pull/259))
- Remove extensions from default output name ([#279](https://github.com/unjs/unbuild/pull/279))
- **rollup:** Check module id against externals as well ([#270](https://github.com/unjs/unbuild/pull/270))
- **esbuild:** Apply minify with corresponding loader ([#254](https://github.com/unjs/unbuild/pull/254))
- **esbuild:** Do not minify declarations ([83b3ed2](https://github.com/unjs/unbuild/commit/83b3ed2))
- **mkdist:** Allow passing all possible options ([f40a889](https://github.com/unjs/unbuild/commit/f40a889))
- Clean dist directories only once for multi builds ([11c47c8](https://github.com/unjs/unbuild/commit/11c47c8))
- **auto:** Avoid warning for existing files ([#287](https://github.com/unjs/unbuild/pull/287))

### 💅 Refactors

- **rollup:** ⚠️ Improve esbuild options handling ([#278](https://github.com/unjs/unbuild/pull/278))

### 📦 Build

- ⚠️ Make typescript a peer dependency ([f31c6a4](https://github.com/unjs/unbuild/commit/f31c6a4))

### 🏡 Chore

- **release:** V1.2.1 ([968612b](https://github.com/unjs/unbuild/commit/968612b))
- Update badges ([#260](https://github.com/unjs/unbuild/pull/260))
- Update all non major dependencies ([9518aa8](https://github.com/unjs/unbuild/commit/9518aa8))
- Update dev dependencies ([a446556](https://github.com/unjs/unbuild/commit/a446556))
- Lint code ([87e5035](https://github.com/unjs/unbuild/commit/87e5035))
- Fix lint issue ([b711242](https://github.com/unjs/unbuild/commit/b711242))
- Lint code ([6ac2e9f](https://github.com/unjs/unbuild/commit/6ac2e9f))
- Add autofix ci ([075b7ad](https://github.com/unjs/unbuild/commit/075b7ad))
- Format with prettier v3 ([40ec1d9](https://github.com/unjs/unbuild/commit/40ec1d9))
- Update mkdist ([1234f75](https://github.com/unjs/unbuild/commit/1234f75))
- Enable declaration for min + sourcemap fixture ([7dcda3f](https://github.com/unjs/unbuild/commit/7dcda3f))

#### ⚠️ Breaking Changes

- **rollup:** ⚠️ Improve esbuild options handling ([#278](https://github.com/unjs/unbuild/pull/278))
- ⚠️ Make typescript a peer dependency ([f31c6a4](https://github.com/unjs/unbuild/commit/f31c6a4))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Sukka <isukkaw@gmail.com>
- Wang Zhi ([@yfwz100](http://github.com/yfwz100))
- Patryk Tomczyk
- JounQin ([@JounQin](http://github.com/JounQin))
- ZHAO Jin-Xiang <xiaoxiangmoe@gmail.com>
- LitoMore
- 科科 <bernankez@qq.com>

## v1.2.1

[compare changes](https://github.com/unjs/unbuild/compare/v1.2.0...v1.2.1)

### 💅 Refactors

- Update to consola v3 ([3bb25b2](https://github.com/unjs/unbuild/commit/3bb25b2))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.2.0

[compare changes](https://github.com/unjs/unbuild/compare/v1.1.2...v1.2.0)

### 🚀 Enhancements

- **rollup:** Add `jsx` and `tsx` to esbuild loader defaults ([#198](https://github.com/unjs/unbuild/pull/198))
- **rollup:** Allow regular expressions in `externals` array ([#145](https://github.com/unjs/unbuild/pull/145))
- **mkdist:** Add new `pattern` option ([#139](https://github.com/unjs/unbuild/pull/139))
- Support esbuild `charset` option ([#190](https://github.com/unjs/unbuild/pull/190))
- **rollup:** Allow passing any all common esbuild options ([8e81e2a](https://github.com/unjs/unbuild/commit/8e81e2a))
- **rollup:** Show size of bundled npm packages in cli output ([#243](https://github.com/unjs/unbuild/pull/243))

### 🩹 Fixes

- Pass missing esbuild jsx factory options ([#224](https://github.com/unjs/unbuild/pull/224))
- **rollup:** Handle array format for `rollup.alias.entries` option ([#220](https://github.com/unjs/unbuild/pull/220))
- **rollup:** Enable `interop: compat` for cjs compatibility ([#215](https://github.com/unjs/unbuild/pull/215))

### 📖 Documentation

- Add `types` to default `exports` ([#226](https://github.com/unjs/unbuild/pull/226))
- Remove `types` field suggestion for now ([e8988ae](https://github.com/unjs/unbuild/commit/e8988ae))

### 🏡 Chore

- Update lockfile ([cc99946](https://github.com/unjs/unbuild/commit/cc99946))
- Fix lint issues ([ee1ced8](https://github.com/unjs/unbuild/commit/ee1ced8))
- Recreate lockfile with pnpm 8 ([06d0044](https://github.com/unjs/unbuild/commit/06d0044))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Kid
- Ntnyq ([@ntnyq](http://github.com/ntnyq))
- Marco Solazzi <marco.solazzi@gmail.com>
- Zoeyzhao19
- Dunqing ([@Dunqing](http://github.com/Dunqing))
- XLor <yjl9903@onekuma.cn>

## v1.1.2

[compare changes](https://github.com/unjs/unbuild/compare/v1.1.1...v1.1.2)

### 💅 Refactors

- Use `fs.mkdir` instead of `mkdirp` ([6ee6384](https://github.com/unjs/unbuild/commit/6ee6384))
- Use `fs.mkdir` instead of `mkdirp` ([8e6962e](https://github.com/unjs/unbuild/commit/8e6962e))

### 🏡 Chore

- Update dependencies ([87bea65](https://github.com/unjs/unbuild/commit/87bea65))

### ❤️ Contributors

- Pooya Parsa <pooya@pi0.io>

## v1.1.1

[compare changes](https://github.com/unjs/unbuild/compare/v1.1.0...v1.1.1)

### 🩹 Fixes

- Use fs instead of rimraf ([bbd374d](https://github.com/unjs/unbuild/commit/bbd374d))

### ❤️ Contributors

- Pooya Parsa <pooya@pi0.io>

## v1.1.0

[compare changes](https://github.com/unjs/unbuild/compare/v1.0.2...v1.1.0)

### 🚀 Enhancements

- Update all rollup dependencies ([3d1b976](https://github.com/unjs/unbuild/commit/3d1b976))

### 🩹 Fixes

- Prevent minification of `.d.ts` files ([#185](https://github.com/unjs/unbuild/pull/185))

### 🎨 Styles

- Format with prettier ([818ced7](https://github.com/unjs/unbuild/commit/818ced7))

### ❤️ Contributors

- Pooya Parsa <pooya@pi0.io>
- Marco Solazzi <marco.solazzi@gmail.com>

## v1.0.2

[compare changes](https://github.com/unjs/unbuild/compare/v1.0.1...v1.0.2)

### 🩹 Fixes

- Do not throw error on absolute windows paths ([#166](https://github.com/unjs/unbuild/pull/166))

### 🏡 Chore

- Remove unused dependency ([79cc03d](https://github.com/unjs/unbuild/commit/79cc03d))

### ❤️ Contributors

- Pooya Parsa <pooya@pi0.io>
- Daniel Roe <daniel@roe.dev>

### [1.0.1](https://github.com/unjs/unbuild/compare/v1.0.0...v1.0.1) (2022-11-16)

## [1.0.0](https://github.com/unjs/unbuild/compare/v0.9.4...v1.0.0) (2022-11-16)

### [0.8.9](https://github.com/unjs/unbuild/compare/v0.8.8...v0.8.9) (2022-08-18)

### Bug Fixes

- **rollup:** remove wrong context ([67d1d38](https://github.com/unjs/unbuild/commit/67d1d38e976e5e72c79ac49155f0047c6a8ff0ee))

### [0.8.8](https://github.com/unjs/unbuild/compare/v0.8.7...v0.8.8) (2022-08-11)

### Bug Fixes

- **rollup:** seperate dynamic chunks from shared chunk names ([aaf8227](https://github.com/unjs/unbuild/commit/aaf8227692f5c11b93ed034d5528fb69f255601f))

### [0.8.7](https://github.com/unjs/unbuild/compare/v0.8.6...v0.8.7) (2022-08-10)

### Bug Fixes

- include all files for total size report ([7bce76d](https://github.com/unjs/unbuild/commit/7bce76ddbc52151452c0bbc59b5d809850ed024c))

### [0.8.6](https://github.com/unjs/unbuild/compare/v0.8.5...v0.8.6) (2022-08-10)

### [0.8.5](https://github.com/unjs/unbuild/compare/v0.8.4...v0.8.5) (2022-08-10)

### Features

- `name` option defaulting to package name ([c3979ab](https://github.com/unjs/unbuild/commit/c3979abde77cd7393d4c4e7fa231a3496923e4aa))
- **rollup:** use hashed chunk names ([850b013](https://github.com/unjs/unbuild/commit/850b013da4da6463be84b552889a507f9d6e1085))

### Bug Fixes

- **rollup:** unmark chunk names as external imports ([59debad](https://github.com/unjs/unbuild/commit/59debad1cfb5a6fcb31f032b11d82ff11eafa519))

### [0.8.4](https://github.com/unjs/unbuild/compare/v0.8.3...v0.8.4) (2022-08-10)

### Bug Fixes

- **rollup:** handle stubbing multiple exports ([f215525](https://github.com/unjs/unbuild/commit/f2155253e9a2cd9d33e552006d31acc9355b72e7))

### [0.8.3](https://github.com/unjs/unbuild/compare/v0.8.2...v0.8.3) (2022-08-10)

### Bug Fixes

- **rollup:** escape stub import paths ([63a3c11](https://github.com/unjs/unbuild/commit/63a3c1163fa7bdd26cfbd9ea0cc06acf27919d3c))
- **rollup:** fix stub type hints ([38d95be](https://github.com/unjs/unbuild/commit/38d95be7c9295052553c441a746ed78385d164fd))
- **rollup:** normalize stub entry path ([f7272e0](https://github.com/unjs/unbuild/commit/f7272e09f866bf02372597a151c1b2f686f2cd5b))

### [0.8.2](https://github.com/unjs/unbuild/compare/v0.8.1...v0.8.2) (2022-08-10)

### Bug Fixes

- **rollup:** fix stub export resolution issues ([63961e4](https://github.com/unjs/unbuild/commit/63961e4009264d73763bea402728509e82bf0c13))

### [0.8.1](https://github.com/unjs/unbuild/compare/v0.8.0...v0.8.1) (2022-08-10)

### Bug Fixes

- update mlly ([26bc33c](https://github.com/unjs/unbuild/commit/26bc33c8bbcff5a3e12a197deeb70acdf7c379ec))

## [0.8.0](https://github.com/unjs/unbuild/compare/v0.7.6...v0.8.0) (2022-08-10)

### ⚠ BREAKING CHANGES

- always enable `esmResolve` for `jiti` (stub and config)
- exit with code (1) on build warnings (#98)

### Features

- always enable `esmResolve` for `jiti` (stub and config) ([b87c8df](https://github.com/unjs/unbuild/commit/b87c8df9bbd27081bba00dfb43f9e75cb540990c))
- exit with code (1) on build warnings ([#98](https://github.com/unjs/unbuild/issues/98)) ([ffc0d7c](https://github.com/unjs/unbuild/commit/ffc0d7c63f53e531eb66c6ea3d32cfe144ecd988))
- **rollup:** generated named exports in esm stub ([c9fce24](https://github.com/unjs/unbuild/commit/c9fce24d5ad1c987d469846715b668c855435280))

### [0.7.6](https://github.com/unjs/unbuild/compare/v0.7.5...v0.7.6) (2022-07-20)

### Bug Fixes

- **pkg:** use `default` export condition to avoid breaking change ([858d35d](https://github.com/unjs/unbuild/commit/858d35de754dcc76f55e3ba8d01945be9c6e9bee)), closes [#89](https://github.com/unjs/unbuild/issues/89)

### [0.7.5](https://github.com/unjs/unbuild/compare/v0.7.4...v0.7.5) (2022-07-20)

### Features

- enable `esmResolve` when loading `build.config` ([#93](https://github.com/unjs/unbuild/issues/93)) ([c856812](https://github.com/unjs/unbuild/commit/c856812ef28ba2aac3d57030b4db087d0369cd6c))

### Bug Fixes

- **pkg:** add types field for exports ([#89](https://github.com/unjs/unbuild/issues/89)) ([457f043](https://github.com/unjs/unbuild/commit/457f0434b43b9e16cbbe1b54c61bfc5dcaf666a6))
- properly calculate bytes of output size ([#82](https://github.com/unjs/unbuild/issues/82)) ([1888978](https://github.com/unjs/unbuild/commit/1888978944ae3384585e7da54ba0a4c0f55e9eb2))

### [0.7.4](https://github.com/unjs/unbuild/compare/v0.7.3...v0.7.4) (2022-04-13)

### Bug Fixes

- **deps:** update mlly ([c935845](https://github.com/unjs/unbuild/commit/c935845905cac9db007c6c3442557c6c84057460))

### [0.7.3](https://github.com/unjs/unbuild/compare/v0.7.2...v0.7.3) (2022-04-12)

### Bug Fixes

- resolve asbolute path to jiti for pnpm support ([#58](https://github.com/unjs/unbuild/issues/58)) ([81d6da7](https://github.com/unjs/unbuild/commit/81d6da7894533b020c6a2c4a5991eecce1824b18))
- **stub:** use `file://` protocol for windows compatibility ([12a99c1](https://github.com/unjs/unbuild/commit/12a99c1fa2bb8ce9341cb9a62bd1faf8b8f265e0))
- work around issue building with pnpm ([#57](https://github.com/unjs/unbuild/issues/57)) ([eb7da84](https://github.com/unjs/unbuild/commit/eb7da84b5665ef11d1942ec7c70820d46d20f905))

### [0.7.2](https://github.com/unjs/unbuild/compare/v0.7.1...v0.7.2) (2022-03-25)

### Bug Fixes

- revert builtins from default externals ([0b808c6](https://github.com/unjs/unbuild/commit/0b808c603d1686afe8352a7e279d6c254b62a29c))

### [0.7.1](https://github.com/unjs/unbuild/compare/v0.7.0...v0.7.1) (2022-03-25)

### Bug Fixes

- add `builtins` and `node:` prefixes to externals ([2af233d](https://github.com/unjs/unbuild/commit/2af233d16797ffdf331c3c311b874d41ab75dac8))

## [0.7.0](https://github.com/unjs/unbuild/compare/v0.6.9...v0.7.0) (2022-03-09)

### ⚠ BREAKING CHANGES

- update all dependencies

### Features

- make rollup-plugin-dts options configurable ([#52](https://github.com/unjs/unbuild/issues/52)) ([e710503](https://github.com/unjs/unbuild/commit/e710503cda58a2691a6ed04abe91c346dae66d21))
- update all dependencies ([fc7c164](https://github.com/unjs/unbuild/commit/fc7c1646f13adbc3fcaa9397e25951d39fb5dc21))

### [0.6.9](https://github.com/unjs/unbuild/compare/v0.6.8...v0.6.9) (2022-01-27)

### Features

- allow peerDeps as import entry points ([#43](https://github.com/unjs/unbuild/issues/43)) ([755981d](https://github.com/unjs/unbuild/commit/755981dc98a17898ab45d6d794eac3023b7d0298))

### [0.6.8](https://github.com/unjs/unbuild/compare/v0.6.7...v0.6.8) (2022-01-21)

### Bug Fixes

- **rollup:** ensure output subdirectory exists ([#40](https://github.com/unjs/unbuild/issues/40)) ([b964655](https://github.com/unjs/unbuild/commit/b96465550f89b9d0a1354b7ed315659dfa653917))

### [0.6.7](https://github.com/unjs/unbuild/compare/v0.6.6...v0.6.7) (2021-12-14)

### Features

- **rollup:** replace and per-plugin configuration ([6d185b2](https://github.com/unjs/unbuild/commit/6d185b260ce40099380fed5f1dd9d123c2459cf0))

### [0.6.6](https://github.com/unjs/unbuild/compare/v0.6.5...v0.6.6) (2021-12-14)

### Bug Fixes

- update mkdist ([46272a1](https://github.com/unjs/unbuild/commit/46272a1339763116cdb8366b655f5a0c3421dd4e))

### [0.6.5](https://github.com/unjs/unbuild/compare/v0.6.4...v0.6.5) (2021-12-14)

### Bug Fixes

- fix nested config types to be optional ([d48e0ac](https://github.com/unjs/unbuild/commit/d48e0ac48eb460daacb51843078cee73993c8243))

### [0.6.4](https://github.com/unjs/unbuild/compare/v0.6.3...v0.6.4) (2021-12-14)

### Features

- auto config preset ([#30](https://github.com/unjs/unbuild/issues/30)) ([fe1ac94](https://github.com/unjs/unbuild/commit/fe1ac940d6c3617e8d9679a7f458c991c69eaafa))
- resolve tsx and jsx files ([#31](https://github.com/unjs/unbuild/issues/31)) ([03d7056](https://github.com/unjs/unbuild/commit/03d705617177ef0efbab0f0b6a5c6b7bb3f062b5))
- support alias and esbuild config ([#29](https://github.com/unjs/unbuild/issues/29)) ([b0b09e0](https://github.com/unjs/unbuild/commit/b0b09e04b35487090109e2a76e6b9b3ef3e449ff))
- validate build outputs against `package.json` ([#33](https://github.com/unjs/unbuild/issues/33)) ([c9ce0b0](https://github.com/unjs/unbuild/commit/c9ce0b0bc5e1e38734c72393f15cd28516703e19))

### Bug Fixes

- external peerDependencies ([#32](https://github.com/unjs/unbuild/issues/32)) ([ba82fcb](https://github.com/unjs/unbuild/commit/ba82fcb5dd84dfdf3b3ab5e435e0c269c8659e0c))

### [0.6.3](https://github.com/unjs/unbuild/compare/v0.6.2...v0.6.3) (2021-12-03)

### Bug Fixes

- shebang support ([#28](https://github.com/unjs/unbuild/issues/28)) ([cb8c4a2](https://github.com/unjs/unbuild/commit/cb8c4a2b65f5eecdb8cef6fd8dab092e3e4a72ab))

### [0.6.2](https://github.com/unjs/unbuild/compare/v0.6.1...v0.6.2) (2021-12-03)

### Features

- shebang support ([12ccc15](https://github.com/unjs/unbuild/commit/12ccc15d42a360995280aec057e44cb1bfba0c87)), closes [#27](https://github.com/unjs/unbuild/issues/27)

### [0.6.1](https://github.com/unjs/unbuild/compare/v0.6.0...v0.6.1) (2021-12-03)

### Features

- allow programmatic inputConfig ([9493837](https://github.com/unjs/unbuild/commit/9493837636f203657d5166eba277eee83e959e21))

### Bug Fixes

- `hooks` type in config should be partial ([62fd953](https://github.com/unjs/unbuild/commit/62fd9534bb82b69bd97091ff45a9947546e18d9a))
- register programmatic hooks ([867ebc5](https://github.com/unjs/unbuild/commit/867ebc52dd7654cb0e41a61d6833461c178d2a28))
- resolve outDir relative to rootDir ([ba18055](https://github.com/unjs/unbuild/commit/ba18055a42a939a692e063cb95ad18f559bbb5c4))
- show error if code is not `MODULE_NOT_FOUND` ([82d9432](https://github.com/unjs/unbuild/commit/82d9432ae29bc61459b71b3809868c8b6af26946))
- use tryRequire for package.json ([31ab840](https://github.com/unjs/unbuild/commit/31ab840c56ca807577082d8216bee87ef23d977f))

## [0.6.0](https://github.com/unjs/unbuild/compare/v0.5.13...v0.6.0) (2021-12-03)

### ⚠ BREAKING CHANGES

- extract rollup specific global options

### Features

- `mkdist:` hooks ([46f8b96](https://github.com/unjs/unbuild/commit/46f8b966242f06a9fc8f321795c4dc9c8ea32b5c))
- `rollup:` hooks ([43cb0da](https://github.com/unjs/unbuild/commit/43cb0da484380d9208bd28a0f39bbcb6ae8ae113))
- auto external peerDeps ([#25](https://github.com/unjs/unbuild/issues/25)) ([f629d74](https://github.com/unjs/unbuild/commit/f629d747c2e525cc21416fe177dd243417276be0))
- basic preset support ([1c0f772](https://github.com/unjs/unbuild/commit/1c0f772259a4216e5f3e922144312b3d3cc5b7aa))
- support `build:before` and `build:after` hooks ([c834e56](https://github.com/unjs/unbuild/commit/c834e56765510346f2c2901176cf09a0e3b1a39f))
- support `unbuild` key from `package.json` ([ee16f56](https://github.com/unjs/unbuild/commit/ee16f56e9927c2c61fbee8db8e8c369b9e066902))
- untyped hooks ([e5ddb8e](https://github.com/unjs/unbuild/commit/e5ddb8ed0542e3a18be21090993392a200d529dc))

### Bug Fixes

- **stub:** re-export `default` in dts stub ([#26](https://github.com/unjs/unbuild/issues/26)) ([468347f](https://github.com/unjs/unbuild/commit/468347f39e9c270c865975b3bde46dbd753d94f2))

- extract rollup specific global options ([0dfb39f](https://github.com/unjs/unbuild/commit/0dfb39fcdf90a5842ffd56440860ef25b058cdb4))

### [0.5.13](https://github.com/unjs/unbuild/compare/v0.5.12...v0.5.13) (2021-11-18)

### Features

- upgrade to untyped 0.3.x ([a7f50b8](https://github.com/unjs/unbuild/commit/a7f50b8e292a06998197b739de1af67dfc061c40))

### [0.5.12](https://github.com/unjs/unbuild/compare/v0.5.11...v0.5.12) (2021-11-18)

### Features

- raw import support ([0af3032](https://github.com/unjs/unbuild/commit/0af30328571e4d9864211e52fa0bb2f4542571f3))

### Bug Fixes

- de-default rollup-plugin-esbuild (resolves [#23](https://github.com/unjs/unbuild/issues/23)) ([e88fc72](https://github.com/unjs/unbuild/commit/e88fc72b0b18f2041ec0501db5402625079e62cf))

### [0.5.11](https://github.com/unjs/unbuild/compare/v0.5.10...v0.5.11) (2021-10-22)

### Bug Fixes

- allow cjs for ext in types ([e878d1d](https://github.com/unjs/unbuild/commit/e878d1d4fb8ab808367df52e2a536db1da104c68))

### [0.5.10](https://github.com/unjs/unbuild/compare/v0.5.9...v0.5.10) (2021-10-21)

### Bug Fixes

- **rollup:** use cjs compatible json exports ([06d7b9d](https://github.com/unjs/unbuild/commit/06d7b9d2aedbb75d56a9e11bc31fd2ee0551a09d)), closes [nuxt/framework#1335](https://github.com/nuxt/framework/issues/1335)

### [0.5.9](https://github.com/unjs/unbuild/compare/v0.5.8...v0.5.9) (2021-10-21)

### Features

- use json plugin to allow treeshaking ([562e4d1](https://github.com/unjs/unbuild/commit/562e4d1110d3d0675f5205874f5088cbaa3dc3d6))

### [0.5.8](https://github.com/unjs/unbuild/compare/v0.5.7...v0.5.8) (2021-10-20)

### [0.5.7](https://github.com/unjs/unbuild/compare/v0.5.6...v0.5.7) (2021-10-13)

### [0.5.6](https://github.com/unjs/unbuild/compare/v0.5.5...v0.5.6) (2021-10-01)

### Features

- cjsBridge and emitCJS ([74a64c1](https://github.com/unjs/unbuild/commit/74a64c100a983ba5965c3177194261fd5d595b7d))

### [0.5.5](https://github.com/unjs/unbuild/compare/v0.5.4...v0.5.5) (2021-09-29)

### Bug Fixes

- **rollup:** don't ignore built-in requires to transform into import ([00c6b21](https://github.com/unjs/unbuild/commit/00c6b2103168793c359e2e1fcf18e45ce064982c))

### [0.5.4](https://github.com/unjs/unbuild/compare/v0.5.3...v0.5.4) (2021-09-21)

### [0.5.3](https://github.com/unjs/unbuild/compare/v0.5.2...v0.5.3) (2021-09-21)

### Bug Fixes

- enable back interopDefault for esm stub for now ([079bb51](https://github.com/unjs/unbuild/commit/079bb51b6e985e989f61ca58234142cdef45bca8))

### [0.5.2](https://github.com/unjs/unbuild/compare/v0.5.1...v0.5.2) (2021-09-21)

### Bug Fixes

- avoid interopDefault for esm stub ([6a36080](https://github.com/unjs/unbuild/commit/6a360801afbf04d3889d2abe8acfac6b709fc094))

### [0.5.1](https://github.com/unjs/unbuild/compare/v0.5.0...v0.5.1) (2021-09-21)

### Bug Fixes

- **rollup:** add `interopDefault` for jiti stub ([b1bf926](https://github.com/unjs/unbuild/commit/b1bf9266413bed041ef38693ef735ce754955895))

## [0.5.0](https://github.com/unjs/unbuild/compare/v0.4.2...v0.5.0) (2021-09-20)

### ⚠ BREAKING CHANGES

- use `.cjs` extension

### Features

- use `.cjs` extension ([a1c8c0f](https://github.com/unjs/unbuild/commit/a1c8c0fb9d93dad57e876e3876e91854cb321612))

### Bug Fixes

- **pkg:** use explicit .cjs extension ([909a539](https://github.com/unjs/unbuild/commit/909a5395714525a883cf1d9f91b9f7c4b3f1621a))
- **rollup:** stub esm with jiti for typescript support ([6bab21f](https://github.com/unjs/unbuild/commit/6bab21f366600d071a0a182d88968023380ff3ec))

### [0.4.2](https://github.com/unjs/unbuild/compare/v0.4.1...v0.4.2) (2021-08-09)

### Bug Fixes

- **stub:** use junction links for windows support ([56aaf4b](https://github.com/unjs/unbuild/commit/56aaf4b9101b708015cc5c38cdaf11c598c5bf77))

### [0.4.1](https://github.com/unjs/unbuild/compare/v0.4.0...v0.4.1) (2021-07-29)

## [0.4.0](https://github.com/unjs/unbuild/compare/v0.3.2...v0.4.0) (2021-07-22)

### ⚠ BREAKING CHANGES

- upgrade `untyped` (#14)

- upgrade `untyped` ([#14](https://github.com/unjs/unbuild/issues/14)) ([caa57c9](https://github.com/unjs/unbuild/commit/caa57c931e652ac60c8cf8aa0f46739c6749e549))

### [0.3.2](https://github.com/unjs/unbuild/compare/v0.3.1...v0.3.2) (2021-07-08)

### Bug Fixes

- don't warn for every src file in windows ([#10](https://github.com/unjs/unbuild/issues/10)) ([e4d18aa](https://github.com/unjs/unbuild/commit/e4d18aa020533810dc297acda923a4edcfce9114))

### [0.3.1](https://github.com/unjs/unbuild/compare/v0.3.0...v0.3.1) (2021-06-16)

### Bug Fixes

- change esbuild target to es2019 ([a91ec26](https://github.com/unjs/unbuild/commit/a91ec26abef272a30e94f0568b0004cf9351c19c))

## [0.3.0](https://github.com/unjs/unbuild/compare/v0.2.3...v0.3.0) (2021-05-24)

### ⚠ BREAKING CHANGES

- update dependencies

- update dependencies ([293dd7f](https://github.com/unjs/unbuild/commit/293dd7fc4383b5608dc09a20359840369030142e))

### [0.2.3](https://github.com/unjs/unbuild/compare/v0.2.2...v0.2.3) (2021-04-23)

### Features

- pass ext option to mkdist ([2c9a513](https://github.com/unjs/unbuild/commit/2c9a513014bab7d5b0cab67e6952647c085edf11))

### [0.2.2](https://github.com/unjs/unbuild/compare/v0.2.1...v0.2.2) (2021-04-21)

### Bug Fixes

- **mkdist:** rmdir before stubbing ([1ca50a4](https://github.com/unjs/unbuild/commit/1ca50a499f692f9d0cfdac4b6384836fb292af93))

### [0.2.1](https://github.com/unjs/unbuild/compare/v0.2.0...v0.2.1) (2021-04-21)

### Bug Fixes

- avoid duplicate name in dist ([cbc8f55](https://github.com/unjs/unbuild/commit/cbc8f55cbdd2df29d328a44b773118ec6e00a079))

## [0.2.0](https://github.com/unjs/unbuild/compare/v0.1.13...v0.2.0) (2021-04-21)

### ⚠ BREAKING CHANGES

- support per-entry outDir

### Features

- support per-entry outDir ([5bb7ac3](https://github.com/unjs/unbuild/commit/5bb7ac384381c08b896c346fde94ca69fe704412))

### Bug Fixes

- enable declarations and export defineBuildConfig ([0e7d62b](https://github.com/unjs/unbuild/commit/0e7d62ba1fcf8dffa7932e0df66ccfee658ea069))

### [0.1.13](https://github.com/unjs/unbuild/compare/v0.1.12...v0.1.13) (2021-04-16)

### Bug Fixes

- rollup config fixes (inline related) ([ae8a3d3](https://github.com/unjs/unbuild/commit/ae8a3d31438f1ea5b1f006a050e94fe335646cf3))

### [0.1.12](https://github.com/unjs/unbuild/compare/v0.1.11...v0.1.12) (2021-04-09)

### Features

- inlineDependencies option ([9f320a1](https://github.com/unjs/unbuild/commit/9f320a17b567c18d3b9212481ae3da4fd06ea1c9))

### [0.1.11](https://github.com/unjs/unbuild/compare/v0.1.10...v0.1.11) (2021-04-09)

### Features

- declaration option to generate types ([936478a](https://github.com/unjs/unbuild/commit/936478a0c6c36373a111a01b9c6e4eb2438e6ed6))

### [0.1.10](https://github.com/unjs/unbuild/compare/v0.1.9...v0.1.10) (2021-04-09)

### Bug Fixes

- exclude package itself from externals ([617a9f9](https://github.com/unjs/unbuild/commit/617a9f98f233e5a5c9764aa3e7802ef374c74944))

### [0.1.9](https://github.com/unjs/unbuild/compare/v0.1.8...v0.1.9) (2021-04-09)

### Bug Fixes

- **pkg:** move typescript to dependencies ([51cd53b](https://github.com/unjs/unbuild/commit/51cd53b836947e35da2639a2ee1602b6aa122499))

### [0.1.8](https://github.com/unjs/unbuild/compare/v0.1.7...v0.1.8) (2021-04-09)

### Bug Fixes

- **rollup:** set respectExternal option for dts ([a596fa3](https://github.com/unjs/unbuild/commit/a596fa333d78178d41a4e7ad0cd0114f3af9cedb))

### [0.1.7](https://github.com/unjs/unbuild/compare/v0.1.6...v0.1.7) (2021-04-09)

### Bug Fixes

- **pkg:** directly add typescript dependency for standalone usage ([adeda2f](https://github.com/unjs/unbuild/commit/adeda2f7b1b6627359316f1fb47afcb1a6119827))

### [0.1.6](https://github.com/unjs/unbuild/compare/v0.1.5...v0.1.6) (2021-04-09)

### Bug Fixes

- **pkg:** specify peerDependencies ([71e8994](https://github.com/unjs/unbuild/commit/71e8994cbb5d17693e94d9d93073b2d2b9011a89))

### [0.1.5](https://github.com/unjs/unbuild/compare/v0.1.4...v0.1.5) (2021-04-09)

### Bug Fixes

- ensure parent dir for link ([87e75b3](https://github.com/unjs/unbuild/commit/87e75b35c380a65eaa05e30adce2d2a675340216))

### [0.1.4](https://github.com/unjs/unbuild/compare/v0.1.3...v0.1.4) (2021-04-09)

### Bug Fixes

- use mkdirp ([c54e393](https://github.com/unjs/unbuild/commit/c54e393ea3512b837f64dcf7c55507e0df9d3de1))

### [0.1.3](https://github.com/unjs/unbuild/compare/v0.1.2...v0.1.3) (2021-04-09)

### Bug Fixes

- update deps and use interopDefault ([6b0f39a](https://github.com/unjs/unbuild/commit/6b0f39a8270ed1927d806ab04ce9fc160c3353f6))

### [0.1.2](https://github.com/unjs/unbuild/compare/v0.1.1...v0.1.2) (2021-04-09)

### Features

- link module to itself during stub ([5a1f9cd](https://github.com/unjs/unbuild/commit/5a1f9cd7b574eaf0f8ca503ecf70b0ff35bfe23b))
- schema loader ([e2388bb](https://github.com/unjs/unbuild/commit/e2388bb3b3d23b8fc9a9d9a8a2a4d62e981602c8))

### 0.1.1 (2021-04-07)
