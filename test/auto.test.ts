import { expect } from 'chai'
import jiti from 'jiti'

const { inferEntries, getEntrypointPaths } = jiti(import.meta.url)('../src/auto') as typeof import('../src/auto')

describe('inferEntries', () => {
  it('recognises main and module outputs', () => {
    const result = inferEntries({ main: 'dist/test.cjs', module: 'dist/test.mjs' }, ['src/', 'src/test.ts'])
    expect(result).to.deep.equal({
      cjs: true,
      dts: false,
      entries: [{ input: 'src/test' }]
    })
  })

  it('handles binary outputs', () => {
    expect(inferEntries({ bin: 'dist/cli.cjs' }, ['src/', 'src/cli.ts'])).to.deep.equal({
      cjs: true,
      dts: false,
      entries: [{ input: 'src/cli' }]
    })
    expect(inferEntries({ bin: { nuxt: 'dist/cli.js' } }, ['src/', 'src/cli.ts'])).to.deep.equal({
      cjs: true,
      dts: false,
      entries: [{ input: 'src/cli' }]
    })
    expect(inferEntries({ bin: { nuxt: 'dist/cli.js' }, type: 'module' }, ['src/', 'src/cli.ts'])).to.deep.equal({
      cjs: false,
      dts: false,
      entries: [{ input: 'src/cli' }]
    })
  })

  it('recognises `type: module` projects', () => {
    const result = inferEntries({ main: 'dist/test.js', type: 'module' }, ['src/', 'src/test.ts'])
    expect(result).to.deep.equal({
      cjs: false,
      dts: false,
      entries: [{ input: 'src/test' }]
    })
  })

  it('matches nested entrypoint paths', () => {
    const result = inferEntries({ exports: 'dist/runtime/index.js' }, ['src/', 'src/other/runtime/index.ts'])
    expect(result).to.deep.equal({
      cjs: false,
      dts: false,
      entries: [{ input: 'src/other/runtime/index' }]
    })
  })

  it('handles declarations from `types`', () => {
    expect(inferEntries({ main: 'dist/test.cjs', types: 'custom/handwritten.d.ts' }, ['src/', 'src/test.ts'])).to.deep.equal({
      cjs: true,
      dts: false,
      entries: [{ input: 'src/test' }
      ]
    })
    expect(inferEntries({ main: 'dist/test.cjs', module: 'dist/test.mjs', types: 'dist/test.d.ts' }, ['src/', 'src/test.ts'])).to.deep.equal({
      cjs: true,
      dts: true,
      entries: [{ input: 'src/test' }
      ]
    })
    expect(inferEntries({ main: 'dist/test.cjs', module: 'dist/test.mjs', typings: 'dist/test.d.ts' }, ['src/', 'src/test.ts'])).to.deep.equal({
      cjs: true,
      dts: true,
      entries: [{ input: 'src/test' }
      ]
    })
  })

  it('handles types within exports`', () => {
    const result = inferEntries({ exports: { types: 'dist/test.d.ts', import: 'dist/test.mjs', require: 'dist/test.cjs' } }, ['src/', 'src/test.ts'])
    expect(result).to.deep.equal({
      cjs: true,
      dts: true,
      entries: [{ input: 'src/test' }]
    })
  })

  it('gracefully handles unknown entries', () => {
    expect(inferEntries({ exports: 'dist/test.js' }, ['src/', 'src/index.ts'])).to.deep.equal({
      cjs: false,
      entries: [],
      dts: false
    })
  })

  it('ignores top-level exports', () => {
    expect(inferEntries({ exports: { './*': './*' } }, ['src/', 'src/', 'src/index.ts'])).to.deep.equal({
      cjs: false,
      entries: [],
      dts: false
    })
  })

  it('handles multiple entries', () => {
    expect(inferEntries({ exports: { '.': './dist/index.cjs', './test': './dist/test.cjs' } }, ['src/', 'src/', 'src/index.ts', 'src/test.mjs'])).to.deep.equal({
      cjs: true,
      dts: false,
      entries: [
        { input: 'src/index' },
        { input: 'src/test' }
      ]
    })
  })

  it('recognises directory mappings', () => {
    expect(inferEntries({ exports: './dist/runtime/*' }, ['src/', 'src/runtime/', 'src/runtime/test.js'])).to.deep.equal({
      cjs: false,
      dts: false,
      entries: [{ format: 'esm', input: 'src/runtime/', outDir: './dist/runtime/' }]
    })
    expect(inferEntries({ exports: { './runtime/*': './dist/runtime/*.mjs,' } }, ['src/', 'src/runtime/'])).to.deep.equal({
      cjs: false,
      dts: false,
      entries: [{ format: 'esm', input: 'src/runtime/', outDir: './dist/runtime/' }]
    })
    expect(inferEntries({ exports: { './runtime/*': { require: './dist/runtime/*' } } }, ['src/', 'src/runtime/'])).to.deep.equal({
      cjs: true,
      dts: false,
      entries: [{ format: 'cjs', input: 'src/runtime/', outDir: './dist/runtime/' }]
    })
  })
})

describe('getEntrypointPaths', () => {
  it('produces a list of possible paths', () => {
    expect(getEntrypointPaths('./dist/foo/bar.js')).to.deep.equal([
      'dist/foo/bar.js',
      'foo/bar.js',
      'bar.js'
    ])
    expect(getEntrypointPaths('./dist/foo/')).to.deep.equal([
      'dist/foo/',
      'foo/'
    ])
  })
})
