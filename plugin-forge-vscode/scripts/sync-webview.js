// 构建并拷贝 plugin-forge 的 dist 产物到本扩展的 media/webview 目录。
// 打包时会临时过滤掉 VSCode Webview 沙箱内不可用的功能，构建后自动恢复原源码。
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const SOURCE = path.resolve(__dirname, '..', '..', 'plugin-forge')
const DEST = path.resolve(__dirname, '..', 'media', 'webview')

function sleepSync(ms) {
  const sab = new SharedArrayBuffer(4)
  Atomics.wait(new Int32Array(sab), 0, 0, ms)
}

// 删除目录，若遇瞬时文件锁（Windows 下常见 EPERM）则短暂等待后重试
function removeDir(dir) {
  if (!fs.existsSync(dir)) return
  let lastErr
  for (let i = 0; i < 5; i++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true })
      return
    } catch (err) {
      lastErr = err
      sleepSync(800)
    }
  }
  throw lastErr
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

// ==================== 功能过滤 ====================
// VSCode Webview 沙箱内不可用、需要从扩展版中移除的功能：
//   - 全屏按钮（requestFullscreen 不可用）
const FILTERS = [
  {
    file: path.join(SOURCE, 'src', 'App.vue'),
    replaces: [
      {
        search: `import FullscreenButton from '@/components/FullscreenButton/FullscreenButton.vue'
`,
        replace: '',
      },
      {
        search: `      <FullscreenButton :target="contentRef" />
`,
        replace: '',
      },
      {
        search: ` ref="contentRef"`,
        replace: '',
      },
      {
        search: `// 主内容区 DOM 引用，作为全屏按钮的目标
const contentRef = ref(null)
`,
        replace: '',
      },
    ],
  },
  {
    file: path.join(SOURCE, 'src', 'vscode', 'index.js'),
    replaces: [
      {
        search: `  // 4. 全屏降级（webview 内不可用）
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
`,
        replace: '',
      },
    ],
  },
]

// 应用过滤：把源文件中的目标片段删除，返回备份（用于恢复）
function applyFilters() {
  const backup = []
  for (const f of FILTERS) {
    if (!fs.existsSync(f.file)) continue
    const orig = fs.readFileSync(f.file, 'utf8')
    let content = orig
    for (const r of f.replaces) {
      content = content.split(r.search).join(r.replace)
    }
    if (content !== orig) {
      fs.writeFileSync(f.file, content, 'utf8')
      backup.push({ file: f.file, orig })
    }
  }
  return backup
}

// 恢复被过滤的源文件
function restore(backup) {
  for (const b of backup) {
    try {
      fs.writeFileSync(b.file, b.orig, 'utf8')
    } catch (err) {
      console.error('[sync-webview] 恢复源文件失败:', b.file, err)
    }
  }
}

function main() {
  const shouldBuild = !process.argv.includes('--no-build')
  let backup = []

  try {
    if (shouldBuild) {
      backup = applyFilters()
      if (backup.length) {
        console.log('[sync-webview] 已过滤不可用功能（全屏按钮）')
      }
      console.log('[sync-webview] 构建 plugin-forge ...')
      removeDir(path.join(SOURCE, 'dist'))
      execSync('npm run build', { cwd: SOURCE, stdio: 'inherit' })
    }

    console.log('[sync-webview] 拷贝 dist -> media/webview ...')
    removeDir(DEST)
    copyDir(path.join(SOURCE, 'dist'), DEST)

    // 同步插件图标 logo.png（从原项目 src/assets/imgs/logo.png 拷贝到本扩展 media/）
    const logoSrc = path.join(SOURCE, 'src', 'assets', 'imgs', 'logo.png')
    const logoDest = path.resolve(__dirname, '..', 'media', 'logo.png')
    if (fs.existsSync(logoSrc)) {
      fs.mkdirSync(path.dirname(logoDest), { recursive: true })
      fs.copyFileSync(logoSrc, logoDest)
      console.log('[sync-webview] 同步 logo.png -> media/logo.png')
    } else {
      console.warn('[sync-webview] 未找到 ' + logoSrc + '，跳过 logo 同步')
    }

    console.log('[sync-webview] 完成')
  } finally {
    if (backup.length) {
      restore(backup)
      console.log('[sync-webview] 已恢复原项目源码（过滤已还原）')
    }
  }
}

main()
