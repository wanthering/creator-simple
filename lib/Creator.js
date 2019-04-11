const inquirer = require('inquirer')
const { loadOptions, saveOptions } = require('./utils/options')
const PromptModuleAPI = require('./PromptModuleAPI')

class Creator {

  constructor(name, context, promptModules) {
    this.name = name
    this.context = context

    // 初始化四个prompt模块
    const { presetPrompt, featurePrompt } = this.initPresetAndFeaturePrompt()
    this.presetPrompt = presetPrompt
    this.featurePrompt = featurePrompt
    this.injectedPrompts = []
    this.extraPrompts = this.initExtraPrompts()

    // promptCompleteCbs用于在弹窗结束后调用
    this.promptCompleteCbs = []

    const promptAPI = new PromptModuleAPI(this)
    if(promptModules && Array.isArray(promptModules)){
      promptModules.forEach(m => m(promptAPI))
    }
  }

  initPresetAndFeaturePrompt(){

    const presets = loadOptions().presets || {}
    const presetNames = Object.keys(presets)
    const presetChoices = presetNames.map(n => ({name: n, value: n}))

    const presetPrompt = {
      name: 'preset',
      type: 'list',
      message: `Please pick a preset:`,
      choices: [
        ...presetChoices,
        {
          name: 'default (babel, eslint)',
          value: 'default'
        },
        {
          name: 'Manually select features',
          value: '__manual__'
        }
      ]
    }

    const featurePrompt = {
      name: 'features',
      when: answers => answers.preset === '__manual__',
      type: 'checkbox',
      message: 'Check the features needed for your project:',
      choices: [],
      pageSize: 10
    }

    return {
      presetPrompt,
      featurePrompt
    }
  }

  initExtraPrompts(){
    const extraPrompts = [
      {
        name: 'useConfigFiles',
        when: answers => answers.preset === '__manual__',
        type: 'list',
        message: 'Where do you prefer placing config for Babel, PostCSS, ESLint, etc.?',
        choices: [
          {
            name: 'In dedicated config files',
            value: 'files'
          },
          {
            name: 'In package.json',
            value: 'pkg'
          }
        ]
      },
      {
        name: 'save',
        when: answers => answers.preset === '__manual__',
        type: 'confirm',
        message: 'Save this as a preset for future projects?',
        default: false
      },
      {
        name: 'saveName',
        when: answers => answers.save,
        type: 'input',
        message: 'Save preset as:'
      }
    ]

    const { execSync } = require('child_process')
    const hasYarn = ()=>{
      try {
        execSync('yarnpkg --version', { stdio: 'ignore' })
        return true
      } catch (e) {
        return false
      }
    }

    const savedOptions = loadOptions()
    if (!savedOptions.packageManager && hasYarn()) {
      extraPrompts.push({
        name: 'packageManager',
        type: 'list',
        message: 'Pick the package manager to use when installing dependencies:',
        choices: [
          {
            name: 'Use Yarn',
            value: 'yarn',
            short: 'Yarn'
          },
          {
            name: 'Use NPM',
            value: 'npm',
            short: 'NPM'
          }
        ]
      })
    }
    return extraPrompts

  }


  /**
   * step1: 弹窗询问并解析
   */
  async promptAndResolveModules() {
    let preset
    // 获取弹窗交互结果
    const answers = await inquirer.prompt(this.resolvePrompt())

    if (answers.packageManager) {
      saveOptions({
        packageManager: answers.packageManager
      })
    }

    // 解析preset
    if (answers.preset && answers.preset !== '__manual__') {
      preset = await this.resolvePreset(answers.preset)
    } else {
      // manual自定义模式
      preset = {
        useConfigFiles: answers.useConfigFiles === 'files',
        plugins: {}
      }
      // 在弹窗结束后，调用promptCompleteCbs
      this.promptCompleteCbs.forEach(cb => cb(answers, preset))
    }

    // 存储到.vuerc
    if(answers.save && answers.saveName){
      let presets = loadOptions().presets || {}
      presets[answers.saveName] = preset
      saveOptions({presets})
    }

    return preset
  }

  /**
   *
   * 解析并返回。
   */
  async resolvePreset(name) {
    let preset
    const savedPresets = loadOptions().presets || {}

    if (name in savedPresets) {
      preset = savedPresets[name]
    }
    if (name === 'default' && !preset) {
      preset = {
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
      }
    }

    if (!preset) {
      console.error('找不到presets')
      process.exit(1)
    }

    return preset
  }


  /**
   * 整合最终的弹窗
   */
  resolvePrompt() {
    const prompts = [
      this.presetPrompt,
      this.featurePrompt,
      ...this.injectedPrompts,
      ...this.extraPrompts
    ]
    return prompts
  }
}

module.exports = Creator
