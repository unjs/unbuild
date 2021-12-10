import { defineBuildConfig } from '../../src'

export default defineBuildConfig({
  preset: './build.preset',
  entries: [
    'src/index',
    { input: 'src/schema', builder: 'untyped' }
  ]
})
