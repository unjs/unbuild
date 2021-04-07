import type { BuildConfig } from './src/types'

export default <BuildConfig> {
  entries: [
    'src/index',
    'src/cli'
  ],
  dependencies: [
    'esbuild'
  ]
}
