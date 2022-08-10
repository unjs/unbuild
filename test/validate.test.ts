import { fileURLToPath } from 'url'
import consola from 'consola'
import { join } from 'pathe'
import { describe, it, expect } from 'vitest'
import { validateDependencies, validatePackage } from '../src/validate'
import { BuildEntry } from '../src/types'

describe('validatePackage', () => {
  it('detects missing files', () => {
    const buildContext = {
      warnings: new Set()
    } as any

    validatePackage({
      main: './dist/test',
      bin: {
        './cli': './dist/cli'
      },
      module: 'dist/mod',
      exports: {
        './runtime/*': './runtime/*.mjs',
        '.': { node: './src/index.ts' }
      }
    }, join(fileURLToPath(import.meta.url), '../fixture'), buildContext)

    const warnings = Array.from(buildContext.warnings)

    expect(warnings[0]).to.include('Potential missing')
    expect(warnings[0]).not.to.include('src/index.ts')

    for (const file of ['dist/test', 'dist/cli', 'dist/mod', 'runtime']) {
      expect(warnings[0]).to.include(file)
    }
  })
})

describe('validateDependecies', () => {
  it('detects implicit deps', () => {
    const warnings = new Set<string>()

    validateDependencies({
      warnings,
      pkg: {},
      buildEntries: [],
      hooks: [] as any,
      usedImports: new Set(['pkg-a/core']),
      options: {
        externals: [],
        dependencies: ['react'],
        peerDependencies: [],
        devDependencies: [],
        rootDir: '.',
        entries: [] as BuildEntry[],
        clean: false,
        outDir: 'dist',
        stub: false,
        alias: {},
        replace: {},
        rollup: {
          replace: false,
          alias: false,
          resolve: false,
          json: false,
          esbuild: false,
          commonjs: false
        }
      }
    })

    expect(Array.from(warnings)[0]).to.include('Potential implicit dependencies found:')
  })

  it('does not print implicit deps warning for peerDependencies', () => {
    const logs: string[] = []
    consola.mock(type => type === 'warn' ? (str: string) => logs.push(str) : () => { })

    validateDependencies({
      pkg: {},
      buildEntries: [],
      hooks: [] as any,
      usedImports: new Set(['pkg-a/core']),
      options: {
        externals: [],
        dependencies: ['react'],
        peerDependencies: ['pkg-a'],
        devDependencies: [],
        rootDir: '.',
        entries: [] as BuildEntry[],
        clean: false,
        outDir: 'dist',
        stub: false,
        alias: {},
        replace: {},
        rollup: {
          replace: false,
          alias: false,
          resolve: false,
          json: false,
          esbuild: false,
          commonjs: false
        }
      }
    })

    expect(logs.length).to.eq(0)
  })
})
