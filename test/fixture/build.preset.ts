import { definePreset } from '../../src'

export default definePreset({
  declaration: true,
  rollup: {
    cjsBridge: true
  },
  hooks: {
    'build:before': () => { console.log('Before build') },
    'build:done': () => { console.log('After build') }
  }
})
