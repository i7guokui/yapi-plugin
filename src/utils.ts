// 复制到剪切板
export async function copyToClipboard(text: string) {
  try {
    // 写剪切板的api，兼容性不好
    await navigator.clipboard.writeText(text)
  } catch (err) {
    // 上面报错时，兼容处理
    console.log(err)
    const inp = document.createElement('input')
    inp.type = 'text'
    inp.value = text
    document.body.appendChild(inp)
    inp.select()
    document.execCommand('Copy')
    document.body.removeChild(inp)
  }
}
