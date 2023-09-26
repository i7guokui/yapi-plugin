import { Msg } from './constants'

window.addEventListener('message', async function (event: any) {
  const { data } = event
  try {
    if (data.type === Msg.executeFunc) {
      const { queryType, reqBodyType, resBodyType, apiData, generateTemplate } = data.data
      const func = new Function('queryType', 'reqBodyType', 'resBodyType', 'apiData', generateTemplate)
      const result = func(queryType, reqBodyType, resBodyType, apiData) || ''
      event.source.window.postMessage(
        {
          data: result,
          index: data.index,
        },
        event.origin
      )
    } else if (data.type === Msg.diyKeyType) {
      const { typeStr, diyKeyTypeTemplate } = data.data
      const func = new Function('key', 'type', diyKeyTypeTemplate)
      const typeLines = typeStr.split('\n')
      const result = typeLines
        .map((line: string) => {
          return line.replace(
            /^(\s*?)(\w+)(\??:\s?)(\w+)((\[\])?;?)$/,
            (match: string, startSpace: string, key: string, separator: string, type: string, end: string) => {
              const result = func(key, type) || [key, type]
              return `${startSpace}${result[0]}${separator}${result[1]}${end}`
            }
          )
        })
        .join('\n')
      event.source.window.postMessage(
        {
          data: result,
          index: data.index,
        },
        event.origin
      )
    }
  } catch (error) {
    event.source.window.postMessage(
      {
        error,
        index: data.index,
      },
      event.origin
    )
  }
})
