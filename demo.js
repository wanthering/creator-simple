const inquirer  = require('inquirer')

const run = async ()=>{
  const answer = await inquirer.prompt([{
    name: 'preset',
    type: 'list',
    message: `Please pick a preset:`,
    choices: [
      {
        name: 'custom (babel, eslint)',
        value: 'custom'
      },
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
  }])
  console.log('你选择的答案为：',answer)
}

run()