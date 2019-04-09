const RootConfig = require('root-config')

const vueConfig = new RootConfig('.vuerc', joi => {

  const presetSchema = joi.object().keys({
    bare: joi.boolean(),
    useConfigFiles: joi.boolean(),
    router: joi.boolean(),
    routerHistoryMode: joi.boolean(),
    vuex: joi.boolean(),
    cssPreprocessor: joi.string().only(['sass', 'less', 'stylus']),
    plugins: joi.object().required(),
    configs: joi.object()
  })

  return joi.object({
    packageManager: joi.string().only(['yarn', 'npm']),
    useTaobaoRegistry: joi.boolean(),
    presets: joi.object().pattern(/^/, presetSchema)
  })
})


const loadOptions = () => {
  return vueConfig.loadOptions()
}

const saveOptions = (toSave) => {
  return vueConfig.saveOptions(toSave)
}

const rcPath = vueConfig.rcPath

module.exports = { loadOptions, saveOptions, rcPath }