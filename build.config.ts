import type { BuildConfig } from './src/types'

export default <BuildConfig> {
  declaration: true,
  entries: [
    'src/index',
    'src/cli'
  ],
  dependencies: [
    'esbuild',
    'typescript'
  ]
}
