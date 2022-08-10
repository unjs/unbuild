# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.8.5](https://github.com/unjs/unbuild/compare/v0.8.4...v0.8.5) (2022-08-10)


### Features

* `name` option defaulting to package name ([c3979ab](https://github.com/unjs/unbuild/commit/c3979abde77cd7393d4c4e7fa231a3496923e4aa))
* **rollup:** use hashed chunk names ([850b013](https://github.com/unjs/unbuild/commit/850b013da4da6463be84b552889a507f9d6e1085))


### Bug Fixes

* **rollup:** unmark chunk names as external imports ([59debad](https://github.com/unjs/unbuild/commit/59debad1cfb5a6fcb31f032b11d82ff11eafa519))

### [0.8.4](https://github.com/unjs/unbuild/compare/v0.8.3...v0.8.4) (2022-08-10)


### Bug Fixes

* **rollup:** handle stubbing multiple exports ([f215525](https://github.com/unjs/unbuild/commit/f2155253e9a2cd9d33e552006d31acc9355b72e7))

### [0.8.3](https://github.com/unjs/unbuild/compare/v0.8.2...v0.8.3) (2022-08-10)


### Bug Fixes

* **rollup:** escape stub import paths ([63a3c11](https://github.com/unjs/unbuild/commit/63a3c1163fa7bdd26cfbd9ea0cc06acf27919d3c))
* **rollup:** fix stub type hints ([38d95be](https://github.com/unjs/unbuild/commit/38d95be7c9295052553c441a746ed78385d164fd))
* **rollup:** normalize stub entry path ([f7272e0](https://github.com/unjs/unbuild/commit/f7272e09f866bf02372597a151c1b2f686f2cd5b))

### [0.8.2](https://github.com/unjs/unbuild/compare/v0.8.1...v0.8.2) (2022-08-10)


### Bug Fixes

* **rollup:** fix stub export resolution issues ([63961e4](https://github.com/unjs/unbuild/commit/63961e4009264d73763bea402728509e82bf0c13))

### [0.8.1](https://github.com/unjs/unbuild/compare/v0.8.0...v0.8.1) (2022-08-10)


### Bug Fixes

* update mlly ([26bc33c](https://github.com/unjs/unbuild/commit/26bc33c8bbcff5a3e12a197deeb70acdf7c379ec))

## [0.8.0](https://github.com/unjs/unbuild/compare/v0.7.6...v0.8.0) (2022-08-10)


### ⚠ BREAKING CHANGES

* always enable `esmResolve` for `jiti` (stub and config)
* exit with code (1) on build warnings (#98)

### Features

* always enable `esmResolve` for `jiti` (stub and config) ([b87c8df](https://github.com/unjs/unbuild/commit/b87c8df9bbd27081bba00dfb43f9e75cb540990c))
* exit with code (1) on build warnings ([#98](https://github.com/unjs/unbuild/issues/98)) ([ffc0d7c](https://github.com/unjs/unbuild/commit/ffc0d7c63f53e531eb66c6ea3d32cfe144ecd988))
* **rollup:** generated named exports in esm stub ([c9fce24](https://github.com/unjs/unbuild/commit/c9fce24d5ad1c987d469846715b668c855435280))

### [0.7.6](https://github.com/unjs/unbuild/compare/v0.7.5...v0.7.6) (2022-07-20)


### Bug Fixes

* **pkg:** use `default` export condition to avoid breaking change ([858d35d](https://github.com/unjs/unbuild/commit/858d35de754dcc76f55e3ba8d01945be9c6e9bee)), closes [#89](https://github.com/unjs/unbuild/issues/89)

### [0.7.5](https://github.com/unjs/unbuild/compare/v0.7.4...v0.7.5) (2022-07-20)


### Features

* enable `esmResolve` when loading `build.config` ([#93](https://github.com/unjs/unbuild/issues/93)) ([c856812](https://github.com/unjs/unbuild/commit/c856812ef28ba2aac3d57030b4db087d0369cd6c))


### Bug Fixes

* **pkg:** add types field for exports ([#89](https://github.com/unjs/unbuild/issues/89)) ([457f043](https://github.com/unjs/unbuild/commit/457f0434b43b9e16cbbe1b54c61bfc5dcaf666a6))
* properly calculate bytes of output size ([#82](https://github.com/unjs/unbuild/issues/82)) ([1888978](https://github.com/unjs/unbuild/commit/1888978944ae3384585e7da54ba0a4c0f55e9eb2))

### [0.7.4](https://github.com/unjs/unbuild/compare/v0.7.3...v0.7.4) (2022-04-13)


### Bug Fixes

* **deps:** update mlly ([c935845](https://github.com/unjs/unbuild/commit/c935845905cac9db007c6c3442557c6c84057460))

### [0.7.3](https://github.com/unjs/unbuild/compare/v0.7.2...v0.7.3) (2022-04-12)


### Bug Fixes

* resolve asbolute path to jiti for pnpm support ([#58](https://github.com/unjs/unbuild/issues/58)) ([81d6da7](https://github.com/unjs/unbuild/commit/81d6da7894533b020c6a2c4a5991eecce1824b18))
* **stub:** use `file://` protocol for windows compatibility ([12a99c1](https://github.com/unjs/unbuild/commit/12a99c1fa2bb8ce9341cb9a62bd1faf8b8f265e0))
* work around issue building with pnpm ([#57](https://github.com/unjs/unbuild/issues/57)) ([eb7da84](https://github.com/unjs/unbuild/commit/eb7da84b5665ef11d1942ec7c70820d46d20f905))

### [0.7.2](https://github.com/unjs/unbuild/compare/v0.7.1...v0.7.2) (2022-03-25)


### Bug Fixes

* revert builtins from default externals ([0b808c6](https://github.com/unjs/unbuild/commit/0b808c603d1686afe8352a7e279d6c254b62a29c))

### [0.7.1](https://github.com/unjs/unbuild/compare/v0.7.0...v0.7.1) (2022-03-25)


### Bug Fixes

* add `builtins` and `node:` prefixes to externals ([2af233d](https://github.com/unjs/unbuild/commit/2af233d16797ffdf331c3c311b874d41ab75dac8))

## [0.7.0](https://github.com/unjs/unbuild/compare/v0.6.9...v0.7.0) (2022-03-09)


### ⚠ BREAKING CHANGES

* update all dependencies

### Features

* make rollup-plugin-dts options configurable ([#52](https://github.com/unjs/unbuild/issues/52)) ([e710503](https://github.com/unjs/unbuild/commit/e710503cda58a2691a6ed04abe91c346dae66d21))
* update all dependencies ([fc7c164](https://github.com/unjs/unbuild/commit/fc7c1646f13adbc3fcaa9397e25951d39fb5dc21))

### [0.6.9](https://github.com/unjs/unbuild/compare/v0.6.8...v0.6.9) (2022-01-27)


### Features

* allow peerDeps as import entry points ([#43](https://github.com/unjs/unbuild/issues/43)) ([755981d](https://github.com/unjs/unbuild/commit/755981dc98a17898ab45d6d794eac3023b7d0298))

### [0.6.8](https://github.com/unjs/unbuild/compare/v0.6.7...v0.6.8) (2022-01-21)


### Bug Fixes

* **rollup:** ensure output subdirectory exists ([#40](https://github.com/unjs/unbuild/issues/40)) ([b964655](https://github.com/unjs/unbuild/commit/b96465550f89b9d0a1354b7ed315659dfa653917))

### [0.6.7](https://github.com/unjs/unbuild/compare/v0.6.6...v0.6.7) (2021-12-14)


### Features

* **rollup:** replace and per-plugin configuration ([6d185b2](https://github.com/unjs/unbuild/commit/6d185b260ce40099380fed5f1dd9d123c2459cf0))

### [0.6.6](https://github.com/unjs/unbuild/compare/v0.6.5...v0.6.6) (2021-12-14)


### Bug Fixes

* update mkdist ([46272a1](https://github.com/unjs/unbuild/commit/46272a1339763116cdb8366b655f5a0c3421dd4e))

### [0.6.5](https://github.com/unjs/unbuild/compare/v0.6.4...v0.6.5) (2021-12-14)


### Bug Fixes

* fix nested config types to be optional ([d48e0ac](https://github.com/unjs/unbuild/commit/d48e0ac48eb460daacb51843078cee73993c8243))

### [0.6.4](https://github.com/unjs/unbuild/compare/v0.6.3...v0.6.4) (2021-12-14)


### Features

* auto config preset ([#30](https://github.com/unjs/unbuild/issues/30)) ([fe1ac94](https://github.com/unjs/unbuild/commit/fe1ac940d6c3617e8d9679a7f458c991c69eaafa))
* resolve tsx and jsx files ([#31](https://github.com/unjs/unbuild/issues/31)) ([03d7056](https://github.com/unjs/unbuild/commit/03d705617177ef0efbab0f0b6a5c6b7bb3f062b5))
* support alias and esbuild config ([#29](https://github.com/unjs/unbuild/issues/29)) ([b0b09e0](https://github.com/unjs/unbuild/commit/b0b09e04b35487090109e2a76e6b9b3ef3e449ff))
* validate build outputs against `package.json` ([#33](https://github.com/unjs/unbuild/issues/33)) ([c9ce0b0](https://github.com/unjs/unbuild/commit/c9ce0b0bc5e1e38734c72393f15cd28516703e19))


### Bug Fixes

* external peerDependencies ([#32](https://github.com/unjs/unbuild/issues/32)) ([ba82fcb](https://github.com/unjs/unbuild/commit/ba82fcb5dd84dfdf3b3ab5e435e0c269c8659e0c))

### [0.6.3](https://github.com/unjs/unbuild/compare/v0.6.2...v0.6.3) (2021-12-03)


### Bug Fixes

* shebang support ([#28](https://github.com/unjs/unbuild/issues/28)) ([cb8c4a2](https://github.com/unjs/unbuild/commit/cb8c4a2b65f5eecdb8cef6fd8dab092e3e4a72ab))

### [0.6.2](https://github.com/unjs/unbuild/compare/v0.6.1...v0.6.2) (2021-12-03)


### Features

* shebang support ([12ccc15](https://github.com/unjs/unbuild/commit/12ccc15d42a360995280aec057e44cb1bfba0c87)), closes [#27](https://github.com/unjs/unbuild/issues/27)

### [0.6.1](https://github.com/unjs/unbuild/compare/v0.6.0...v0.6.1) (2021-12-03)


### Features

* allow programmatic inputConfig ([9493837](https://github.com/unjs/unbuild/commit/9493837636f203657d5166eba277eee83e959e21))


### Bug Fixes

* `hooks` type in config should be partial ([62fd953](https://github.com/unjs/unbuild/commit/62fd9534bb82b69bd97091ff45a9947546e18d9a))
* register programmatic hooks ([867ebc5](https://github.com/unjs/unbuild/commit/867ebc52dd7654cb0e41a61d6833461c178d2a28))
* resolve outDir relative to rootDir ([ba18055](https://github.com/unjs/unbuild/commit/ba18055a42a939a692e063cb95ad18f559bbb5c4))
* show error if code is not `MODULE_NOT_FOUND` ([82d9432](https://github.com/unjs/unbuild/commit/82d9432ae29bc61459b71b3809868c8b6af26946))
* use tryRequire for package.json ([31ab840](https://github.com/unjs/unbuild/commit/31ab840c56ca807577082d8216bee87ef23d977f))

## [0.6.0](https://github.com/unjs/unbuild/compare/v0.5.13...v0.6.0) (2021-12-03)


### ⚠ BREAKING CHANGES

* extract rollup specific global options

### Features

* `mkdist:` hooks ([46f8b96](https://github.com/unjs/unbuild/commit/46f8b966242f06a9fc8f321795c4dc9c8ea32b5c))
* `rollup:` hooks ([43cb0da](https://github.com/unjs/unbuild/commit/43cb0da484380d9208bd28a0f39bbcb6ae8ae113))
* auto external peerDeps ([#25](https://github.com/unjs/unbuild/issues/25)) ([f629d74](https://github.com/unjs/unbuild/commit/f629d747c2e525cc21416fe177dd243417276be0))
* basic preset support ([1c0f772](https://github.com/unjs/unbuild/commit/1c0f772259a4216e5f3e922144312b3d3cc5b7aa))
* support `build:before` and `build:after` hooks ([c834e56](https://github.com/unjs/unbuild/commit/c834e56765510346f2c2901176cf09a0e3b1a39f))
* support `unbuild` key from `package.json` ([ee16f56](https://github.com/unjs/unbuild/commit/ee16f56e9927c2c61fbee8db8e8c369b9e066902))
* untyped hooks ([e5ddb8e](https://github.com/unjs/unbuild/commit/e5ddb8ed0542e3a18be21090993392a200d529dc))


### Bug Fixes

* **stub:** re-export `default` in dts stub ([#26](https://github.com/unjs/unbuild/issues/26)) ([468347f](https://github.com/unjs/unbuild/commit/468347f39e9c270c865975b3bde46dbd753d94f2))


* extract rollup specific global options ([0dfb39f](https://github.com/unjs/unbuild/commit/0dfb39fcdf90a5842ffd56440860ef25b058cdb4))

### [0.5.13](https://github.com/unjs/unbuild/compare/v0.5.12...v0.5.13) (2021-11-18)


### Features

* upgrade to untyped 0.3.x ([a7f50b8](https://github.com/unjs/unbuild/commit/a7f50b8e292a06998197b739de1af67dfc061c40))

### [0.5.12](https://github.com/unjs/unbuild/compare/v0.5.11...v0.5.12) (2021-11-18)


### Features

* raw import support ([0af3032](https://github.com/unjs/unbuild/commit/0af30328571e4d9864211e52fa0bb2f4542571f3))


### Bug Fixes

* de-default rollup-plugin-esbuild (resolves [#23](https://github.com/unjs/unbuild/issues/23)) ([e88fc72](https://github.com/unjs/unbuild/commit/e88fc72b0b18f2041ec0501db5402625079e62cf))

### [0.5.11](https://github.com/unjs/unbuild/compare/v0.5.10...v0.5.11) (2021-10-22)


### Bug Fixes

* allow cjs for ext in types ([e878d1d](https://github.com/unjs/unbuild/commit/e878d1d4fb8ab808367df52e2a536db1da104c68))

### [0.5.10](https://github.com/unjs/unbuild/compare/v0.5.9...v0.5.10) (2021-10-21)


### Bug Fixes

* **rollup:** use cjs compatible json exports ([06d7b9d](https://github.com/unjs/unbuild/commit/06d7b9d2aedbb75d56a9e11bc31fd2ee0551a09d)), closes [nuxt/framework#1335](https://github.com/nuxt/framework/issues/1335)

### [0.5.9](https://github.com/unjs/unbuild/compare/v0.5.8...v0.5.9) (2021-10-21)


### Features

* use json plugin to allow treeshaking ([562e4d1](https://github.com/unjs/unbuild/commit/562e4d1110d3d0675f5205874f5088cbaa3dc3d6))

### [0.5.8](https://github.com/unjs/unbuild/compare/v0.5.7...v0.5.8) (2021-10-20)

### [0.5.7](https://github.com/unjs/unbuild/compare/v0.5.6...v0.5.7) (2021-10-13)

### [0.5.6](https://github.com/unjs/unbuild/compare/v0.5.5...v0.5.6) (2021-10-01)


### Features

* cjsBridge and emitCJS ([74a64c1](https://github.com/unjs/unbuild/commit/74a64c100a983ba5965c3177194261fd5d595b7d))

### [0.5.5](https://github.com/unjs/unbuild/compare/v0.5.4...v0.5.5) (2021-09-29)


### Bug Fixes

* **rollup:** don't ignore built-in requires to transform into import ([00c6b21](https://github.com/unjs/unbuild/commit/00c6b2103168793c359e2e1fcf18e45ce064982c))

### [0.5.4](https://github.com/unjs/unbuild/compare/v0.5.3...v0.5.4) (2021-09-21)

### [0.5.3](https://github.com/unjs/unbuild/compare/v0.5.2...v0.5.3) (2021-09-21)


### Bug Fixes

* enable back interopDefault for esm stub for now ([079bb51](https://github.com/unjs/unbuild/commit/079bb51b6e985e989f61ca58234142cdef45bca8))

### [0.5.2](https://github.com/unjs/unbuild/compare/v0.5.1...v0.5.2) (2021-09-21)


### Bug Fixes

* avoid interopDefault for esm stub ([6a36080](https://github.com/unjs/unbuild/commit/6a360801afbf04d3889d2abe8acfac6b709fc094))

### [0.5.1](https://github.com/unjs/unbuild/compare/v0.5.0...v0.5.1) (2021-09-21)


### Bug Fixes

* **rollup:** add `interopDefault` for jiti stub ([b1bf926](https://github.com/unjs/unbuild/commit/b1bf9266413bed041ef38693ef735ce754955895))

## [0.5.0](https://github.com/unjs/unbuild/compare/v0.4.2...v0.5.0) (2021-09-20)


### ⚠ BREAKING CHANGES

* use `.cjs` extension

### Features

* use `.cjs` extension ([a1c8c0f](https://github.com/unjs/unbuild/commit/a1c8c0fb9d93dad57e876e3876e91854cb321612))


### Bug Fixes

* **pkg:** use explicit .cjs extension ([909a539](https://github.com/unjs/unbuild/commit/909a5395714525a883cf1d9f91b9f7c4b3f1621a))
* **rollup:** stub esm with jiti for typescript support ([6bab21f](https://github.com/unjs/unbuild/commit/6bab21f366600d071a0a182d88968023380ff3ec))

### [0.4.2](https://github.com/unjs/unbuild/compare/v0.4.1...v0.4.2) (2021-08-09)


### Bug Fixes

* **stub:** use junction links for windows support ([56aaf4b](https://github.com/unjs/unbuild/commit/56aaf4b9101b708015cc5c38cdaf11c598c5bf77))

### [0.4.1](https://github.com/unjs/unbuild/compare/v0.4.0...v0.4.1) (2021-07-29)

## [0.4.0](https://github.com/unjs/unbuild/compare/v0.3.2...v0.4.0) (2021-07-22)


### ⚠ BREAKING CHANGES

* upgrade `untyped` (#14)

* upgrade `untyped` ([#14](https://github.com/unjs/unbuild/issues/14)) ([caa57c9](https://github.com/unjs/unbuild/commit/caa57c931e652ac60c8cf8aa0f46739c6749e549))

### [0.3.2](https://github.com/unjs/unbuild/compare/v0.3.1...v0.3.2) (2021-07-08)


### Bug Fixes

* don't warn for every src file in windows ([#10](https://github.com/unjs/unbuild/issues/10)) ([e4d18aa](https://github.com/unjs/unbuild/commit/e4d18aa020533810dc297acda923a4edcfce9114))

### [0.3.1](https://github.com/unjs/unbuild/compare/v0.3.0...v0.3.1) (2021-06-16)


### Bug Fixes

* change esbuild target to es2019 ([a91ec26](https://github.com/unjs/unbuild/commit/a91ec26abef272a30e94f0568b0004cf9351c19c))

## [0.3.0](https://github.com/unjs/unbuild/compare/v0.2.3...v0.3.0) (2021-05-24)


### ⚠ BREAKING CHANGES

* update dependencies

* update dependencies ([293dd7f](https://github.com/unjs/unbuild/commit/293dd7fc4383b5608dc09a20359840369030142e))

### [0.2.3](https://github.com/unjs/unbuild/compare/v0.2.2...v0.2.3) (2021-04-23)


### Features

* pass ext option to mkdist ([2c9a513](https://github.com/unjs/unbuild/commit/2c9a513014bab7d5b0cab67e6952647c085edf11))

### [0.2.2](https://github.com/unjs/unbuild/compare/v0.2.1...v0.2.2) (2021-04-21)


### Bug Fixes

* **mkdist:** rmdir before stubbing ([1ca50a4](https://github.com/unjs/unbuild/commit/1ca50a499f692f9d0cfdac4b6384836fb292af93))

### [0.2.1](https://github.com/unjs/unbuild/compare/v0.2.0...v0.2.1) (2021-04-21)


### Bug Fixes

* avoid duplicate name in dist ([cbc8f55](https://github.com/unjs/unbuild/commit/cbc8f55cbdd2df29d328a44b773118ec6e00a079))

## [0.2.0](https://github.com/unjs/unbuild/compare/v0.1.13...v0.2.0) (2021-04-21)


### ⚠ BREAKING CHANGES

* support per-entry outDir

### Features

* support per-entry outDir ([5bb7ac3](https://github.com/unjs/unbuild/commit/5bb7ac384381c08b896c346fde94ca69fe704412))


### Bug Fixes

* enable declarations and export defineBuildConfig ([0e7d62b](https://github.com/unjs/unbuild/commit/0e7d62ba1fcf8dffa7932e0df66ccfee658ea069))

### [0.1.13](https://github.com/unjs/unbuild/compare/v0.1.12...v0.1.13) (2021-04-16)


### Bug Fixes

* rollup config fixes (inline related) ([ae8a3d3](https://github.com/unjs/unbuild/commit/ae8a3d31438f1ea5b1f006a050e94fe335646cf3))

### [0.1.12](https://github.com/unjs/unbuild/compare/v0.1.11...v0.1.12) (2021-04-09)


### Features

* inlineDependencies option ([9f320a1](https://github.com/unjs/unbuild/commit/9f320a17b567c18d3b9212481ae3da4fd06ea1c9))

### [0.1.11](https://github.com/unjs/unbuild/compare/v0.1.10...v0.1.11) (2021-04-09)


### Features

* declaration option to generate types ([936478a](https://github.com/unjs/unbuild/commit/936478a0c6c36373a111a01b9c6e4eb2438e6ed6))

### [0.1.10](https://github.com/unjs/unbuild/compare/v0.1.9...v0.1.10) (2021-04-09)


### Bug Fixes

* exclude package itself from externals ([617a9f9](https://github.com/unjs/unbuild/commit/617a9f98f233e5a5c9764aa3e7802ef374c74944))

### [0.1.9](https://github.com/unjs/unbuild/compare/v0.1.8...v0.1.9) (2021-04-09)


### Bug Fixes

* **pkg:** move typescript to dependencies ([51cd53b](https://github.com/unjs/unbuild/commit/51cd53b836947e35da2639a2ee1602b6aa122499))

### [0.1.8](https://github.com/unjs/unbuild/compare/v0.1.7...v0.1.8) (2021-04-09)


### Bug Fixes

* **rollup:** set respectExternal option for dts ([a596fa3](https://github.com/unjs/unbuild/commit/a596fa333d78178d41a4e7ad0cd0114f3af9cedb))

### [0.1.7](https://github.com/unjs/unbuild/compare/v0.1.6...v0.1.7) (2021-04-09)


### Bug Fixes

* **pkg:** directly add typescript dependency for standalone usage ([adeda2f](https://github.com/unjs/unbuild/commit/adeda2f7b1b6627359316f1fb47afcb1a6119827))

### [0.1.6](https://github.com/unjs/unbuild/compare/v0.1.5...v0.1.6) (2021-04-09)


### Bug Fixes

* **pkg:** specify peerDependencies ([71e8994](https://github.com/unjs/unbuild/commit/71e8994cbb5d17693e94d9d93073b2d2b9011a89))

### [0.1.5](https://github.com/unjs/unbuild/compare/v0.1.4...v0.1.5) (2021-04-09)


### Bug Fixes

* ensure parent dir for link ([87e75b3](https://github.com/unjs/unbuild/commit/87e75b35c380a65eaa05e30adce2d2a675340216))

### [0.1.4](https://github.com/unjs/unbuild/compare/v0.1.3...v0.1.4) (2021-04-09)


### Bug Fixes

* use mkdirp ([c54e393](https://github.com/unjs/unbuild/commit/c54e393ea3512b837f64dcf7c55507e0df9d3de1))

### [0.1.3](https://github.com/unjs/unbuild/compare/v0.1.2...v0.1.3) (2021-04-09)


### Bug Fixes

* update deps and use interopDefault ([6b0f39a](https://github.com/unjs/unbuild/commit/6b0f39a8270ed1927d806ab04ce9fc160c3353f6))

### [0.1.2](https://github.com/unjs/unbuild/compare/v0.1.1...v0.1.2) (2021-04-09)


### Features

* link module to itself during stub ([5a1f9cd](https://github.com/unjs/unbuild/commit/5a1f9cd7b574eaf0f8ca503ecf70b0ff35bfe23b))
* schema loader ([e2388bb](https://github.com/unjs/unbuild/commit/e2388bb3b3d23b8fc9a9d9a8a2a4d62e981602c8))

### 0.1.1 (2021-04-07)
