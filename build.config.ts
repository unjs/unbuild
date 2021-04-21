import { defineBuildConfig } from '.'

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
