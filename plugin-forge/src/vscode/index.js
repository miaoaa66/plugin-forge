// VSCode Webview 适配层
// 仅在 VSCode Webview 环境（存在 acquireVsCodeApi）下生效，普通浏览器环境不做任何改动。
// 桥接受限的浏览器能力：
//   - 文件下载（a[download] + click）→ postMessage 交给扩展端保存
//   - 文件选择（input[type=file]）→ postMessage 打开系统文件对话框
//   - 剪贴板（navigator.clipboard.writeText）→ postMessage 交给扩展端
//   - 全屏（requestFullscreen）→ 降级为拒绝

const isVscode = typeof acquireVsCodeApi === 'function'

let api = null
let seq = 0
const pending = new Map()

function getApi() {
  if (!api) api = acquireVsCodeApi()
  return api
}

function send(type, payload = {}) {
  const id = ++seq
  getApi().postMessage({ id, type, ...payload })
  return new Promise((resolve) => pending.set(id, resolve))
}

function resolveMessage(msg) {
  if (msg && typeof msg === 'object' && msg.id != null && pending.has(msg.id)) {
    const resolve = pending.get(msg.id)
    pending.delete(msg.id)
    resolve(msg)
  }
}

if (isVscode) {
  window.addEventListener('message', (e) => resolveMessage(e.data))

  // 全局错误上报：把运行时错误发给扩展，扩展用 VSCode 通知弹出来
  // （这样 webview 即使白屏也能看到具体原因）
  window.addEventListener('error', (e) => {
    try {
      send('error', {
        kind: 'error',
        message: String(e.message || ''),
        source: String(e.filename || ''),
        lineno: e.lineno || 0,
        colno: e.colno || 0,
        stack: e.error && e.error.stack ? String(e.error.stack) : '',
      })
    } catch {}
  })
  window.addEventListener('unhandledrejection', (e) => {
    try {
      const reason = e.reason
      send('error', {
        kind: 'unhandledrejection',
        message: String((reason && reason.message) || reason || ''),
        stack: reason && reason.stack ? String(reason.stack) : '',
      })
    } catch {}
  })
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function base64ToBytes(base64) {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

async function downloadToVscode(href, filename) {
  try {
    let base64
    let mime = 'application/octet-stream'
    if (typeof href === 'string' && href.startsWith('data:')) {
      const m = /^data:([^;,]*)?(;base64)?,(.*)$/s.exec(href)
      mime = (m && m[1]) || mime
      const body = m ? m[3] : ''
      base64 = m && m[2] ? body : btoa(unescape(encodeURIComponent(body)))
    } else {
      const res = await fetch(href)
      const blob = await res.blob()
      mime = blob.type || mime
      base64 = arrayBufferToBase64(await blob.arrayBuffer())
    }
    await send('download', { base64, mime, filename: filename || 'download' })
    return true
  } catch (err) {
    console.error('[vscode-bridge] 下载失败:', err)
    return false
  }
}

async function pickFilesForInput(input) {
  try {
    const res = await send('pickFile', {
      accept: input.accept || '',
      multiple: !!input.multiple,
    })
    const files = res && res.files
    if (!files || !files.length) return
    const dt = new DataTransfer()
    for (const f of files) {
      const bytes = base64ToBytes(f.base64 || '')
      const file = new File([bytes], f.name, { type: f.mime || 'application/octet-stream' })
      dt.items.add(file)
    }
    input.files = dt.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
  } catch (err) {
    console.error('[vscode-bridge] 选择文件失败:', err)
  }
}

async function copyText(text) {
  try {
    await send('copy', { text })
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

// 用 Object.defineProperty 覆盖内置原型方法，规避 ES Module 严格模式下
// 对非可写属性赋值的 TypeError。内置方法通常是 configurable，因此 defineProperty
// 即使在 writable=false 时也能成功。
function patch(target, prop, value) {
  try {
    Object.defineProperty(target, prop, {
      value,
      writable: true,
      configurable: true,
      enumerable: false,
    })
    return true
  } catch (err) {
    console.warn('[vscode-bridge] patch 失败:', prop, err)
    return false
  }
}

export function isVscodeEnv() {
  return isVscode
}

export function installVscodeBridge() {
  if (!isVscode) return

  // 1. 拦截 a[download] 下载
  const originalAnchorClick = HTMLAnchorElement.prototype.click
  patch(HTMLAnchorElement.prototype, 'click', function () {
    const href = this.href || this.getAttribute('href') || ''
    const download = this.getAttribute('download') || this.download || ''
    const isBlobOrData =
      typeof href === 'string' && (href.startsWith('blob:') || href.startsWith('data:'))
    if (download || isBlobOrData) {
      downloadToVscode(href, download || 'download')
      return
    }
    return originalAnchorClick.call(this)
  })

  // 2. 拦截文件选择
  const originalInputClick = HTMLInputElement.prototype.click
  patch(HTMLInputElement.prototype, 'click', function () {
    if (this.type === 'file') {
      pickFilesForInput(this)
      return
    }
    return originalInputClick.call(this)
  })

  // 3. 桥接剪贴板
  const clipboardProto = navigator.clipboard ? Object.getPrototypeOf(navigator.clipboard) : null
  if (clipboardProto && clipboardProto.writeText) {
    const originalWriteText = clipboardProto.writeText
    patch(clipboardProto, 'writeText', async function (text) {
      const ok = await copyText(text)
      if (!ok) return originalWriteText.call(this, text)
    })
  }

  // 4. 全屏降级（webview 内不可用）
  if (typeof Element !== 'undefined' && Element.prototype.requestFullscreen) {
    patch(Element.prototype, 'requestFullscreen', function () {
      console.warn('[vscode-bridge] VSCode Webview 内不支持全屏')
      return Promise.reject(new Error('fullscreen not supported in vscode webview'))
    })
  }
  if (typeof Document !== 'undefined' && Document.prototype && Document.prototype.exitFullscreen) {
    patch(Document.prototype, 'exitFullscreen', function () {
      return Promise.reject(new Error('fullscreen not supported in vscode webview'))
    })
  }
}

export default { isVscodeEnv, installVscodeBridge }