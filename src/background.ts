import { Msg } from "./constants"

/** * 监听tab页面变化(用于处理页面logo问题) */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url === undefined) {
    return false
  }
  if (tab.url && tab.url.includes('{matchUrl}')) {
    chrome.tabs.sendMessage(tabId, { type: Msg.urlUpdate, tab: tab }).catch(() => undefined)
  }
})
