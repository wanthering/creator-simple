jest.mock('fs')

const { expectPrompts } = require('inquirer') // from mock
const Creator = require('../Creator')

test('测试最简路径', async() => {

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

  const creator = new Creator('test', '/')
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

test('使用linter作为测试，验证弹夹', async() => {
  // linter的弹窗配置
  const linterModulePrompt = api => {
    api.injectFeature({
      name: 'Linter / Formatter',
      value: 'linter'
    })

    api.injectPrompt({
      name: 'eslintConfig',
      type: 'list',
      message: 'Pick a linter / formatter config:',
      when: answers => answers.features.includes('linter'),
      choices: answers => [
        {
          name: 'ESLint with error prevention only',
          value: 'base'
        },
        {
          name: 'ESLint + Airbnb config',
          value: 'airbnb'
        },
        {
          name: 'ESLint + Standard config',
          value: 'standard'
        }
      ]
    })

    api.injectPrompt({
      name: 'lintOn',
      message: 'Pick additional lint features:',
      when: answers => answers.features.includes('linter'),
      type: 'checkbox',
      choices: [
        {
          name: 'Lint on save',
          value: 'save',
          checked: true
        },
        {
          name: 'Lint and fix on commit',
          value: 'commit'
        }
      ]
    })

    api.onPromptComplete((answers, options) => {
      if (answers.features.includes('linter')) {
        options.plugins['@vue/cli-plugin-eslint'] = {
          config: answers.eslintConfig,
          lintOn: answers.lintOn
        }
      }
    })
  }

  const expectedPrompts = [
    { choose: 1 },
    {
      message: 'features',
      choices: ['Linter'],
      check: [0]
    },
    {
      message: 'Pick a linter / formatter config',
      choices: ['error prevention only', 'Airbnb', 'Standard'],
      choose: 0
    },
    {
      message: 'Pick additional lint features',
      choices: ['on save', 'on commit'],
      check: [0, 1]
    },
    {
      message: 'Where do you prefer placing config',
      choices: ['dedicated', 'package.json'],
      choose: 0
    },
    {
      message: 'Save this as a preset',
      confirm: true
    },
    {
      message: 'Save preset as',
      input: 'test'
    },
    { choose: 1 }
  ]
  expectPrompts(expectedPrompts)

  const creator = new Creator('test', '/', [linterModulePrompt])
  const preset = await creator.promptAndResolveModules()
  expect(preset).toEqual({
    useConfigFiles: true,
    plugins: {
      "@vue/cli-plugin-eslint": {
        config: "base",
        lintOn: [
          "save",
          "commit"
        ]
      }
    }
  })

  const creatorForSaved = new Creator('testForSaved', '/')
  const expectedPromptsForSaved = [
    {
      choices: [
        'test',
        'default',
        'Manually'
      ],
      choose: 0
    }
  ]
  expectPrompts(expectedPromptsForSaved)
  const presetForSaved = await creatorForSaved.promptAndResolveModules()
  expect(presetForSaved).toEqual({
    useConfigFiles: true,
    plugins: {
      "@vue/cli-plugin-eslint": {
        config: "base",
        lintOn: [
          "save",
          "commit"
        ]
      }
    }
  })
})
