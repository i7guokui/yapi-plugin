import { render } from 'solid-js/web'
import { Component, createSignal, onMount } from 'solid-js'
import { EventWithElement } from './types'
import { Option } from './constants'

const Options: Component = () => {
  const [snake2Camel, setSnake2Camel] = createSignal(false)
  const [generateEnabled, setGenerateEnabled] = createSignal(false)
  const [generateTemplate, setGenerateTemplate] = createSignal('')
  let textarea: HTMLTextAreaElement

  onMount(() => {
    chrome.storage.local.get(['snake2Camel', 'generateEnabled', 'generateTemplate']).then(res => {
      setSnake2Camel(res.snake2Camel)
      setGenerateEnabled(res.generateEnabled)
      setGenerateTemplate(res.generateTemplate || '')
    })
  })

  /**
   * checkbox 变更回调
   */
  function handleCheckboxChange(key: string, e: EventWithElement<HTMLInputElement>) {
    const checked = e.currentTarget.checked
    switch (key) {
      case Option.snake2Camel:
        setSnake2Camel(checked)
        break;
      case Option.generateEnabled:
        setGenerateEnabled(checked)
        break;
      default:
        break;
    }
    chrome.storage.local.set({[key]: checked})
  }

  function handleGenerateTemplateChange(e: EventWithElement<HTMLTextAreaElement>) {
    setGenerateTemplate(e.currentTarget.value)
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`
  }

  function handleSaveTemplate() {
    chrome.storage.local.set({generateTemplate: generateTemplate()})
  }

  return (
    <div class="options-container">
      <div class="option-item">
        <label>下划线转小驼峰</label>
        <input type="checkbox" checked={snake2Camel()} onChange={[handleCheckboxChange, Option.snake2Camel]} />
      </div>
      <div class="option-item">
        <label>启用自定义生成内容</label>
        <input type="checkbox" checked={generateEnabled()} onChange={[handleCheckboxChange, Option.generateEnabled]} />
      </div>
      {generateEnabled() && <div>
        <textarea ref={textarea} placeholder="输入自定义内容" value={generateTemplate()} onInput={handleGenerateTemplateChange}></textarea>
        <div class="template-tip">变量 queryType(query 类型声明字符串)、reqBodyType(请求 body 类型声明字符串)、resBodyType(响应 body 类型声明字符串)、apiData(接口返回数据对象) 可用</div>
        <button onClick={handleSaveTemplate}>保存</button>
      </div>}
    </div>
  )
}

render(() => <Options />, document.getElementById('options') as HTMLElement)
