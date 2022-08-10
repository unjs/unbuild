import { describe, it, expect } from 'vitest'
import { extractExportFilenames, inferExportType } from '../src/utils'

describe('inferExportType', () => {
  it('infers export type by condition', () => {
    expect(inferExportType('import')).to.equal('esm')
    expect(inferExportType('require')).to.equal('cjs')
    expect(inferExportType('node')).to.equal('esm')
    expect(inferExportType('some_unknown_condition')).to.equal('esm')
  })
  it('infers export type based on previous conditions', () => {
    expect(inferExportType('import', ['require'])).to.equal('esm')
    expect(inferExportType('node', ['require'])).to.equal('cjs')
    expect(inferExportType('node', ['import'])).to.equal('esm')
    expect(inferExportType('node', ['unknown', 'require'])).to.equal('cjs')
  })
})

describe('extractExportFilenames', () => {
  it('handles strings', () => {
    expect(extractExportFilenames('test')).to.deep.equal([{ file: 'test', type: 'esm' }])
  })
  it('handles nested objects', () => {
    expect(extractExportFilenames({ require: 'test' })).to.deep.equal([{ file: 'test', type: 'cjs' }])
    // @ts-ignore TODO: fix pkg-types
    expect(extractExportFilenames({ require: { node: 'test', other: { import: 'this', require: 'that' } } })).to.deep.equal([{ file: 'test', type: 'cjs' }, { file: 'this', type: 'esm' }, { file: 'that', type: 'cjs' }])
  })
})
