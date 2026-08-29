// uTools 插件预加载脚本：在窗口加载前执行，可访问 utools API 与 Electron 能力。
// 首版做最小能力桥接：剪贴板兜底；预留 onPluginEnter 扩展点。
// 纯前端应用无需 Node 模块，保持轻量。

// 剪贴板兜底：navigator.clipboard 在部分环境下受限时，退回 utools.copyText
if (typeof utools !== 'undefined' && utools.copyText) {
  const origWriteText = navigator.clipboard && navigator.clipboard.writeText
  if (origWriteText) {
    const clipboardProto = Object.getPrototypeOf(navigator.clipboard)
    const orig = clipboardProto.writeText
    try {
      Object.defineProperty(clipboardProto, 'writeText', {
        value: async function (text) {
          try {
            return await orig.call(this, text)
          } catch (err) {
            try {
              return utools.copyText(text)
            } catch (err2) {
              throw err
            }
          }
        },
        writable: true,
        configurable: true,
        enumerable: false,
      })
    } catch (e) {
      // 忽略 patch 失败，保持默认行为
    }
  }
}

// 预留：进入插件时可根据 feature code 处理搜索框输入
// if (typeof utools !== 'undefined' && utools.onPluginEnter) {
//   utools.onPluginEnter(({ code, type, payload }) => {
//     // code === 'plugin-forge' 时进入
//   })
// }
