const inquirer = require('inquirer')
const {loadOptions} = require('./utils/options')

class Creator{
  constructor(name, context){
    this.name = name
    this.context = context
  }

  /**
   * step1: 弹窗询问并解析
   */
  async promptAndResolveModules(){
    let preset
    // 获取弹窗交互结果
    const answer = await inquirer.prompt(this.resolvePrompt())
    // 解析preset
    preset= await this.resolvePreset(answer.preset)
    return preset
  }

  /**
   *
   * 解析并返回。
   */
  async resolvePreset(name){
    let preset
    const savedPresets = loadOptions().presets || {}

    if(name in savedPresets){
      preset = savedPresets[name]
    }
    if(name==='default' && !preset){
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

    if(!preset){
      console.error('找不到presets')
      process.exit(1)
    }
    return preset
  }


  resolvePrompt(){
    const prompts =  [{
      name: 'preset',
      type: 'list',
      message: `Please pick a preset:`,
      choices: [
        {
          name: 'default (babel, eslint)',
          value: 'default'
        },
        {
          name: 'Manually select features',
          value: '__manual__'
        }
      ]
    },{
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
    }]
    return prompts
  }
}

module.exports = Creator
