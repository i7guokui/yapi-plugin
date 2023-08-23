## yapi-plugin 使用说明

1. clone 项目到本地
2. 搜索 `{matchUrl}` 替换成对应的 yapi 文档地址，格式类似 `https://test.example.com`
3. 下载依赖，然后执行 `npm run build`
2. 打开 chrome菜单 -> 更多工具 -> 拓展程序
3. 右上角启用`开发者模式`
4. 点击左上角`加载已解压的拓展程序`
5. 选择项目路径下的`public`文件夹
6. 打开 yapi 文档地址，查看一个 api 详情页面，右上角应该会出现3个copy按钮
7. 设置界面支持设置字段名下划线转小驼峰，以及自定义生成内容并复制到剪切板
8. 自定义生成内容示例
```js
function toFirstUpperCase(str = '') {
  return str.substring(0, 1).toUpperCase() + str.substring(1)
}

function toCamelString(str = '') {
  return str.replace(/-(\w)/g, (match, p1) => p1.toUpperCase())
}

const path = apiData.path
const functionName = path.split('/').pop()
const functionNameNew = toCamelString(functionName)
const functionNameNewFirstUpperCase = toFirstUpperCase(functionNameNew)
const reqTypeName = `Req${functionNameNewFirstUpperCase}`
const resTypeName = `Res${functionNameNewFirstUpperCase}`
return `type ${reqTypeName} = ${reqBodyType}

type ${resTypeName} = ${resBodyType}

export function ${functionNameNew} (data: ${reqTypeName}): Promise<${resTypeName}> {
  return axios.${apiData.method.toLowerCase()}(\`${path}\`, {
    method: '${apiData.method}',
    ${apiData.method === 'GET' ? 'params: data' : 'data,'}
  })
}`
```