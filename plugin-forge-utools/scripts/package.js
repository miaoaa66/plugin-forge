// 组装 plugin-forge 的 uTools 插件目录（dist/）：
// 1. 在 Web 应用目录执行 npm run build
// 2. 把 dist 产物拷贝到本扩展的 dist/ 目录
// 3. 注入 plugin.json / preload.js / logo.png
//
// 注：uTools v5.0+ 安装包为 .upxs（加密 + 开发者签名），只能由「uTools 开发者工具」
//     图形界面生成，本脚本不再产 .upx；dist/ 是核心交付物，开发者工具会原样打包成 .upxs。
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const SOURCE = path.resolve(__dirname, '..', '..', 'plugin-forge') // Web 应用
const ROOT = path.resolve(__dirname, '..') // 本扩展目录
const DIST = path.join(ROOT, 'dist')

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

function main() {
  const shouldBuild = !process.argv.includes('--no-build')

  if (shouldBuild) {
    console.log('[package] 构建 plugin-forge ...')
    removeDir(path.join(SOURCE, 'dist'))
    execSync('npm run build', { cwd: SOURCE, stdio: 'inherit' })
  }

  console.log('[package] 拷贝 dist -> dist ...')
  removeDir(DIST)
  copyDir(path.join(SOURCE, 'dist'), DIST)

  console.log('[package] 注入 plugin.json / preload.js ...')
  fs.copyFileSync(path.join(ROOT, 'plugin.json'), path.join(DIST, 'plugin.json'))
  fs.copyFileSync(path.join(ROOT, 'preload.js'), path.join(DIST, 'preload.js'))

  console.log('[package] 注入 logo.png ...')
  const logoSrc = path.join(SOURCE, 'src', 'assets', 'imgs', 'logo.png')
  if (fs.existsSync(logoSrc)) {
    fs.copyFileSync(logoSrc, path.join(DIST, 'logo.png'))
  } else {
    console.warn('[package] 未找到 ' + logoSrc + '，跳过 logo')
  }

  console.log('[package] 完成: dist/ 已就绪，可用 uTools 开发者工具打包成 .upxs')
}

main()
