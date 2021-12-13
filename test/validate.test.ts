import { fileURLToPath } from 'url'
import jiti from 'jiti'
import { expect } from 'chai'
import consola from 'consola'
import { join } from 'pathe'

const { validatePackage } = jiti(import.meta.url)('../src/validate') as typeof import('../src/validate')

describe('validatePackage', () => {
  it('detects missing files', () => {
    const logs: string[] = []
    consola.mock(type => type === 'warn' ? (str: string) => logs.push(str) : () => {})

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
