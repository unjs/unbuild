import type { BuildConfig } from 'unbuild'

export default <BuildConfig>{
  cjsBridge: true,
  entries: [
    'src/index',
    { input: 'src/schema', builder: 'untyped' }
  ]
}
