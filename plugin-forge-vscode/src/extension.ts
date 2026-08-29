import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

const VIEW_TYPE = 'plugin-forge.mainView'

function getNonce(): string {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.csv': 'text/csv',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
}

function mimeFromExt(ext: string): string {
  return MIME_MAP[ext.toLowerCase()] || 'application/octet-stream'
}

// 把 el-upload 的 accept（如 "image/*" 或 ".png,.jpg"）转成 showOpenDialog 的 filters
function parseAccept(accept: string): Record<string, string[]> | undefined {
  if (!accept) return undefined
  const raw = accept.split(',').map((s) => s.trim()).filter(Boolean)
  if (!raw.length) return undefined

  const filters: Record<string, string[]> = {}
  const byLabel: Record<string, string[]> = {}

  const add = (label: string, ext: string) => {
    ;(byLabel[label] = byLabel[label] || []).push(ext.replace(/^\./, ''))
  }

  for (const item of raw) {
    if (item === 'image/*') {
      for (const e of ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'ico', 'avif']) {
        add('图片', e)
      }
    } else if (item === 'audio/*') {
      for (const e of ['mp3', 'wav', 'ogg', 'm4a', 'aac']) {
        add('音频', e)
      }
    } else if (item === 'video/*') {
      for (const e of ['mp4', 'webm', 'mov']) {
        add('视频', e)
      }
    } else if (item.startsWith('.')) {
      add('文件', item)
    } else if (item.includes('/')) {
      // 具体 mime，如 image/png → 取后缀
      const ext = item.split('/')[1]
      if (ext && ext !== '*') add('文件', `.${ext}`)
    }
  }

  for (const [label, exts] of Object.entries(byLabel)) {
    if (exts.length) filters[label] = exts
  }
  return Object.keys(filters).length ? filters : undefined
}

class PluginForgeViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media', 'webview')],
    }
    webviewView.webview.html = this.getHtml(webviewView.webview)
    webviewView.webview.onDidReceiveMessage((msg) => this.handleMessage(webviewView.webview, msg))
  }

  private getHtml(webview: vscode.Webview): string {
    const webviewRoot = vscode.Uri.joinPath(this.extensionUri, 'media', 'webview')
    const indexHtml = path.join(webviewRoot.fsPath, 'index.html')
    let html: string
    try {
      html = fs.readFileSync(indexHtml, 'utf8')
    } catch {
      return this.getFallbackHtml(webview)
    }

    const nonce = getNonce()

    // 把 src/href 中的 ./相对路径改写为 webview-resource 绝对 URI。
    // 不依赖 <base>，避免 base href 与 localResourceRoots 匹配的边缘问题。
    html = html.replace(
      /(src|href)="\.\/([^"]+)"/g,
      (_m, attr: string, rel: string) => {
        const segs = rel.replace(/^\.\//, '').split('/')
        const abs = webview.asWebviewUri(vscode.Uri.joinPath(webviewRoot, ...segs)).toString()
        return `${attr}="${abs}"`
      }
    )

    const csp = [
      `default-src 'none'`,
      `script-src ${webview.cspSource} 'nonce-${nonce}'`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `img-src ${webview.cspSource} data: blob: https: http:`,
      `font-src ${webview.cspSource} data:`,
      `connect-src ${webview.cspSource} data: blob: https: http:`,
      `media-src ${webview.cspSource} data: blob:`,
      `worker-src ${webview.cspSource} blob:`,
    ].join('; ')

    // 诊断脚本（内联，有 nonce）：capture 阶段捕获资源加载失败（不冒泡）
    // 和 CSP 违规，直接在 webview 内显示红色横幅，不依赖 postMessage。
    const diag = `<script nonce="${nonce}">
(function(){
  if (document.getElementById('vs-diag')) return;
  var box = document.createElement('div');
  box.id = 'vs-diag';
  box.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;padding:10px 14px;background:rgba(220,38,38,.96);color:#fff;font:12px/1.5 ui-monospace,Consolas,monospace;white-space:pre-wrap;max-height:50vh;overflow:auto;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.4);';
  document.documentElement.appendChild(box);
  function show(msg){ box.textContent += (box.textContent ? '\\n' : '') + msg; }
  function hide(){ box.style.display = 'none'; }
  show('[诊断] webview HTML 已注入 readyState=' + document.readyState);
  window.addEventListener('error', function(e){
    var t = e && e.target;
    if (t && t !== window && t.tagName && /^(SCRIPT|LINK|IMG|FONT)$/.test(t.tagName)) {
      show('[资源失败] ' + t.tagName + ' ' + (t.src || t.href || ''));
    } else {
      show('[运行错误] ' + (e && e.message || '') + (e && e.filename ? ' @' + e.filename + ':' + e.lineno + ':' + e.colno : ''));
    }
  }, true);
  document.addEventListener('securitypolicyviolation', function(e){
    show('[CSP] 违反 ' + e.violatedDirective + ' -> ' + (e.blockedURI || ''));
  });
  window.addEventListener('load', function(){
    show('[诊断] window load readyState=' + document.readyState);
  });
  var checks = 0;
  var iv = setInterval(function(){
    checks++;
    var app = document.getElementById('app');
    var len = app ? app.innerHTML.length : 0;
    if (len > 50) {
      show('[诊断] ' + (checks*0.5).toFixed(1) + 's 后应用已挂载 (#app=' + len + ' 字符)');
      clearInterval(iv);
      setTimeout(hide, 2500);
    } else if (checks >= 20) {
      show('[诊断] ' + (checks*0.5).toFixed(1) + 's 后 #app 仍为空，应用未挂载');
      clearInterval(iv);
    }
  }, 500);
})();
</script>`

    return html
      .replace(
        '<head>',
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}">\n    ${diag}`,
      )
      .replace(/<script type="module"/g, `<script type="module" nonce="${nonce}"`)
  }

  private getFallbackHtml(webview: vscode.Webview): string {
    const nonce = getNonce()
    const csp = `default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline';`
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
</head>
<body style="padding: 16px; font-family: var(--vscode-font-family); color: var(--vscode-foreground);">
  <p>未找到内嵌的 Webview 资源（media/webview/index.html）。</p>
  <p>请先在扩展目录运行 <code>npm run sync</code> 以构建并拷贝 plugin-forge 的产物。</p>
</body>
</html>`
  }

  private async handleMessage(webview: vscode.Webview, msg: any): Promise<void> {
    const { id, type } = msg || {}
    switch (type) {
      case 'download':
        await this.handleDownload(webview, msg, id)
        break
      case 'pickFile':
        await this.handlePickFile(webview, msg, id)
        break
      case 'copy':
        await this.handleCopy(webview, msg, id)
        break
      case 'error':
        this.handleError(msg)
        break
      default:
        webview.postMessage({ id, ok: false, error: 'unknown message type' })
    }
  }

  private handleError(msg: any): void {
    const message = String(msg.message || '')
    // ResizeObserver loop 是 Element Plus 布局初始化时的已知良性浏览器警告，
    // 不是真正的错误，过滤掉避免打扰用户（仍写入控制台方便排查）
    if (message.includes('ResizeObserver loop')) {
      console.warn('[plugin-forge webview] (suppressed benign ResizeObserver warning)')
      return
    }
    const where = msg.source ? ` @${msg.source}:${msg.lineno}:${msg.colno}` : ''
    const title =
      msg.kind === 'unhandledrejection'
        ? `Plugin Forge - 未捕获的异步错误`
        : `Plugin Forge - 运行时错误`
    const body = `${msg.message || ''}${where}`
    console.error('[plugin-forge webview]', msg.message, msg.stack || '')
    vscode.window.showErrorMessage(`${title}: ${body}`)
  }

  private async handleDownload(webview: vscode.Webview, msg: any, id: number): Promise<void> {
    try {
      const bytes = Buffer.from(msg.base64 || '', 'base64')
      const defaultName = msg.filename || 'download'
      const target = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(defaultName),
        saveLabel: '保存',
      })
      if (target) {
        await vscode.workspace.fs.writeFile(target, bytes)
        vscode.window.showInformationMessage(`已保存：${target.fsPath}`)
      }
      webview.postMessage({ id, ok: true, canceled: !target })
    } catch (err) {
      vscode.window.showErrorMessage(`下载失败：${(err as Error).message}`)
      webview.postMessage({ id, ok: false, error: String(err) })
    }
  }

  private async handlePickFile(webview: vscode.Webview, msg: any, id: number): Promise<void> {
    try {
      const filters = parseAccept(msg.accept || '')
      const uris = await vscode.window.showOpenDialog({
        canSelectMany: !!msg.multiple,
        openLabel: '选择',
        filters,
      })
      if (!uris || !uris.length) {
        webview.postMessage({ id, files: [] })
        return
      }
      const files = []
      for (const uri of uris) {
        const bytes = await vscode.workspace.fs.readFile(uri)
        files.push({
          name: path.basename(uri.fsPath),
          mime: mimeFromExt(path.extname(uri.fsPath)),
          base64: Buffer.from(bytes).toString('base64'),
        })
      }
      webview.postMessage({ id, files })
    } catch (err) {
      webview.postMessage({ id, files: [], error: String(err) })
    }
  }

  private async handleCopy(webview: vscode.Webview, msg: any, id: number): Promise<void> {
    try {
      await vscode.env.clipboard.writeText(msg.text || '')
      webview.postMessage({ id, ok: true })
    } catch (err) {
      webview.postMessage({ id, ok: false, error: String(err) })
    }
  }
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      VIEW_TYPE,
      new PluginForgeViewProvider(context.extensionUri),
      { webviewOptions: { retainContextWhenHidden: true } },
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('plugin-forge.open', async () => {
      await vscode.commands.executeCommand(`${VIEW_TYPE}.focus`)
    }),
  )
}

export function deactivate(): void {}
