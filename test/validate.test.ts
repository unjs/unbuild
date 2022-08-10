import { fileURLToPath } from 'url'
import consola from 'consola'
import { join } from 'pathe'
import { describe, it, expect } from 'vitest'
import { validateDependencies, validatePackage } from '../src/validate'
import { BuildEntry } from '../src/types'

describe('validatePackage', () => {
  it('detects missing files', () => {
    const logs: string[] = []
    consola.mock(type => type === 'warn' ? (str: string) => logs.push(str) : () => { })

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
    }, join(fileURLToPath(import.meta.url), '../fixture'))

    expect(logs[0]).to.include('Potential missing')
    expect(logs[0]).not.to.include('src/index.ts')

    for (const file of ['dist/test', 'dist/cli', 'dist/mod', 'runtime']) {
      expect(logs[0]).to.include(file)
    }
  })
})

describe('validateDependecies', () => {
  it('detects implicit deps', () => {
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

    expect(logs[0]).to.include('Potential implicit dependencies found:')
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
