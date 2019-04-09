// 创建一个缓存参数
let pendingAssertions

// expectPrompts 用来注入缓存参数
exports.expectPrompts = assertions => {
  pendingAssertions = assertions
}

exports.prompt = async prompts => {
  // 验证是否存在缓存参数。
  if (!pendingAssertions) {
    throw new Error(`inquirer正在被Mock，且缺少缓存参数: ${prompts}`)
  }

  const answers = {}

  // 打印一下prompts和pendingAssertions
  prompts.forEach((prompt, i) => {
    const a = pendingAssertions[i]

    // 验证message弹窗和预期一样
    if(a.message){
      expect(prompt.message).toMatch(a.message)
    }

    // 验证choices是数组，弹窗和预期值一样
    if(a.choices){
      expect(prompt.choices.length).toBe(a.choices.length)
      for(let i in a.choices){
        expect(prompt.choices[i].name).toMatch(a.choices[i])
      }
    }

    if(a.choose != null){
      // choose有值的情况下，type一般为list
      expect(prompt.type).toBe('list')

      // 设置answers成为与正版相同结果
      answers[prompt.name] = prompt.choices[a.choose].value
    }
  })

  expect(prompts.length).toBe(pendingAssertions.length)

  return answers
}

