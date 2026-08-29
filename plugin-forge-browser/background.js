// 点击工具栏图标时，在新标签页打开完整工具集
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
})
