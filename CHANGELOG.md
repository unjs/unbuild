# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
