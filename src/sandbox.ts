import { Msg } from './constants'

window.addEventListener('message', async function (event: any) {
  const { data } = event
  if (data.type === Msg.executeFunc) {
    const { queryType, reqBodyType, resBodyType, apiData, generateTemplate } = data.data
    const func = new Function('queryType', 'reqBodyType', 'resBodyType', 'apiData', generateTemplate)
    const result =
      func(
        queryType,
        reqBodyType,
        resBodyType,
        apiData
      ) || ''
      event.source.window.postMessage({
        type: Msg.sendExecuteResult,
        data: result
      }, event.origin)
  }
})
