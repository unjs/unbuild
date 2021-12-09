import { expect } from 'chai'
import { resolve } from 'pathe'
import { listRecursively } from '../../src/utils'

const fixtureDir = resolve(__dirname, '../fixture')
const files = [
  'build.config.ts',
  'build.preset.ts',
  'package.json',
  'src/',
  'src/index.ts',
  'src/schema.ts',
  'src/test.html'
]
describe('listRecursively', () => {
  it('lists the files in a directory', () => {
    expect(listRecursively(fixtureDir).filter(m => !m.includes('dist'))).to.deep.equal(files.map(f => `${fixtureDir}/${f}`))
  })
})
