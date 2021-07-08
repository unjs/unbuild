import { defineBuildConfig } from './src'

export default defineBuildConfig({
  declaration: true,
  entries: [
    'src/index',
    'src/cli'
  ],
  dependencies: [
    'esbuild',
    'typescript'
  ]
})
