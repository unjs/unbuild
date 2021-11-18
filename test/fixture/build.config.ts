import type { BuildConfig } from 'unbuild'

export default <BuildConfig>{
  cjsBridge: true,
  declaration: true,
  entries: [
    'src/index',
    { input: 'src/schema', builder: 'untyped' }
  ]
}
