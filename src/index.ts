import { copyToClipboard } from './utils'
import { Msg } from './constants'

// 记录当前 api id，多次点击 copy 时避免重复发送相同的请求
let currentApiId = ''
let currentApiData: any = null
// 按钮容器 div
let div: HTMLDivElement
// 自定义生成 copy 按钮
let generateCopyBtn: HTMLButtonElement
// 是否下划线转小驼峰
let snake2Camel = false
// 是否启用自定义生成
let generateEnabled = false
// 自定义生成模板
let generateTemplate = ''
// 用于通信的 iframe
let iframe: HTMLIFrameElement | null = null

chrome.runtime.onMessage.addListener(function (request) {
  if (request.type == Msg.urlUpdate) {
    onUrlChange()
  }
})

window.addEventListener('message', e => {
  const { data } = e
  if (data.type === Msg.sendExecuteResult) {
    copyToClipboard(data.data)
  }
})

// 监听配置项变更
chrome.storage.onChanged.addListener((changes) => {
  if (changes.snake2Camel) {
    snake2Camel = changes.snake2Camel.newValue
  }
  if (changes.generateEnabled) {
    generateEnabled = changes.generateEnabled.newValue
    if (generateCopyBtn) {
      generateCopyBtn.style.display = generateEnabled ? 'block' : 'none'
    }
  }
  if (changes.generateTemplate) {
    generateTemplate = changes.generateTemplate.newValue
  }
})

// 初始化读取配置项
chrome.storage.local.get(['snake2Camel', 'generateTemplate', 'generateEnabled']).then((res) => {
  snake2Camel = res.snake2Camel || false
  generateEnabled = res.generateEnabled || false
  generateTemplate = res.generateTemplate || ''
  initActionBtn()
})

// url 变化时判断是否需要显示按钮
function onUrlChange() {
  const url = location.href
  div.style.display = /\/project\/\d+\/interface\/api\/\d+/.test(url) ? 'flex' : 'none'
  currentApiId = ''
  currentApiData = null
}

// 初始化 copy 按钮
function initActionBtn() {
  div = document.createElement('div')
  div.className = 'btn-wrapper'
  div.innerHTML = `<button class='btn'>Copy query</button><button class='btn'>Copy req body</button><button class='btn'>Copy res body</button>`
  generateCopyBtn = document.createElement('button')
  generateCopyBtn.style.display = generateEnabled ? 'block' : 'none'
  generateCopyBtn.innerHTML = 'Diy copy'
  generateCopyBtn.className = 'btn'
  div.appendChild(generateCopyBtn)
  onUrlChange()
  document.body.appendChild(div)

  div.addEventListener('click', async (e) => {
    try {
      let apiId = ''
      let apiData = null
      const match = /\/project\/\d+\/interface\/api\/(\d+)/.exec(location.href)
      if (match) {
        apiId = match[1]
      }
      if (apiId && apiId === currentApiId && currentApiData) {
        apiData = currentApiData
      } else {
        apiData = await fetch(`${location.protocol}//${location.host}/api/interface/get?id=${apiId}`)
          .then((res) => res.json())
          .then((res) => {
            if (res.errcode === 0) {
              return res.data
            } else {
              return Promise.reject('data error')
            }
          })
        currentApiId = apiId
        currentApiData = apiData
      }

      const index = [...div.children].findIndex((it) => e.target === it)
      let ret = ''
      switch (index) {
        case 0:
          ret = genQueryType(apiData.req_query)
          break
        case 1:
          ret = apiData.req_body_other ? genDataType(JSON.parse(apiData.req_body_other)) : '{}'
          break
        case 2:
          ret = genDataType(JSON.parse(apiData.res_body)?.properties?.data)
          break
        case 3:
          if (!iframe) {
            iframe = document.createElement('iframe')
            iframe.src = chrome.runtime.getURL('sandbox.html')
            iframe.style.display = 'none'
            document.body.appendChild(iframe)
            await new Promise(resolve => {
              iframe!.onload = resolve
            })
          }
          iframe.contentWindow!.postMessage({ type: Msg.executeFunc, data: {
            queryType: genQueryType(apiData.req_query),
            reqBodyType: apiData.req_body_other ? genDataType(JSON.parse(apiData.req_body_other)) : '{}',
            resBodyType: genDataType(JSON.parse(apiData.res_body)?.properties?.data),
            apiData,
            generateTemplate
          } }, '*');
          break
        default:
          break
      }
      await copyToClipboard(ret)
      const btnText = div.children[index].innerHTML
      div.children[index].innerHTML = 'Done!'
      setTimeout(() => {
        div.children[index].innerHTML = btnText
      }, 1500)
    } catch (err) {
      console.log(err)
    }
  })
}

// 生成 query 类型声明
function genQueryType(data: unknown) {
  if (!Array.isArray(data)) {
    return ''
  }
  if (data.length === 0) {
    return '{}'
  }
  const ret = []
  ret.push(`{\n`)
  data.forEach(({ name, required }) => {
    ret.push(`  ${transformKey(name)}${required === '1' ? ':' : '?:'} string;\n`)
  })
  ret.push('}')
  return ret.join('')
}

// 生成 body 类型声明
function genDataType(data: any, tabCount = 0) {
  if (!data) {
    return '{}'
  }
  if (['boolean', 'string', 'number'].includes(data.type)) {
    return data.type
  }
  if (data.type === 'integer') {
    return 'number'
  }
  if (data.type === 'object') {
    return genObjectType(data, tabCount)
  }
  if (data.type === 'array') {
    return genArrayType(data, tabCount)
  }
}

// 生成对象类型声明
function genObjectType(data: any, tabCount = 0) {
  if (!data.properties) {
    return '{}'
  }
  const requiredFieldDict =
    data.required?.reduce((acc: any, cur: any) => {
      acc[cur] = true
      return acc
    }, {} as any) ?? ({} as any)
  const ret = []
  ret.push(`{\n`)
  Object.entries(data.properties).forEach(([key, value]) => {
    ret.push(
      `${'  '.repeat(tabCount + 1)}${transformKey(key)}${requiredFieldDict[key] ? ':' : '?:'} ${genDataType(
        value,
        tabCount + 1
      )};\n`
    )
  })
  ret.push(`${'  '.repeat(tabCount)}}`)
  return ret.join('')
}

// 生成数组类型声明
function genArrayType(data: any, tabCount = 0): any {
  const { items } = data
  if (['string', 'boolean', 'number'].includes(items.type)) {
    return `${data.items.type}[]`
  }
  if (items.type === 'integer') {
    return 'number[]'
  }
  const ret = []
  ret.push(`Array<`)
  if (items.type === 'object') {
    ret.push(genObjectType(items, tabCount))
  } else if (items.type === 'array') {
    ret.push(genArrayType(items, tabCount))
  }
  ret.push('>')
  return ret.join('')
}

// key 转换
function transformKey(key = '') {
  if (snake2Camel) {
    return key.replace(/_(\w)/g, (match, p1) => p1.toUpperCase())
  }
  return key
}
