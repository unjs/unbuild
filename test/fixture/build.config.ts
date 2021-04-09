import type { BuildConfig } from 'unbuild'

export default <BuildConfig>{
  entries: [
    'src/index',
    { input: 'src/schema', builder: 'untyped' }
  ]
}
