jest.mock('fs')

const { expectPrompts } = require('inquirer') // from mock

test('试一下',async ()=>{
  const Creator = require('../Creator')

  // 设置待验证的弹窗
  const expectedPrompts = [
    {
      message: 'pick a preset',
      choices: [
        'default',
        'Manually select'
      ],
      choose: 0
    },
    {
      message: 'package manager',
      choices: ['Yarn', 'NPM'],
      choose: 0
    }
  ]

  // 通过expectPrompts注入到__mocks__/inquier.js内
  expectPrompts(expectedPrompts)

  const creator = new Creator('test','/')
  const preset = await creator.promptAndResolveModules()

  expect(preset).toEqual({
    router: false,
    vuex: false,
    useConfigFiles: false,
    cssPreprocessor: undefined,
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': {
        config: 'base',
        lintOn: ['save']
      }
    }
  })
})
