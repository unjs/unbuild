import type { BuildConfig } from 'unbuild'

export default <BuildConfig>{
  preset: './build.preset',
  entries: [
    'src/index',
    { input: 'src/schema', builder: 'untyped' }
  ]
}
