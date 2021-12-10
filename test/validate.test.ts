import { fileURLToPath } from 'url'
import jiti from 'jiti'
import { expect } from 'chai'
import consola from 'consola'
import { join } from 'pathe'

const { validateBuildOutputs } = jiti(import.meta.url)('../src/validate') as typeof import('../src/validate')

describe('validateBuildOutputs', () => {
  it('detects missing files', () => {
    const logs: string[] = []
    consola.mock(type => type === 'warn' ? (str: string) => logs.push(str) : () => {})

    validateBuildOutputs({
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

    expect(logs[0]).to.include('Potential missing build outputs')
    expect(logs[0]).not.to.include('src/index.ts')

    for (const file of ['dist/test', 'dist/cli', 'dist/mod', 'runtime']) {
      expect(logs[0]).to.include(file)
    }
  })
})
