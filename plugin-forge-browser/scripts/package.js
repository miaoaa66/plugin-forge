// 构建并打包 plugin-forge 的浏览器插件：
// 1. 在 Web 应用目录执行 npm run build
// 2. 把 dist 产物拷贝到本扩展的 dist/ 目录
// 3. 注入 manifest.json / background.js / icons/
// 4. 用 adm-zip 打成 zip 分发包
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const AdmZip = require('adm-zip')

const SOURCE = path.resolve(__dirname, '..', '..', 'plugin-forge') // Web 应用
const ROOT = path.resolve(__dirname, '..') // 本扩展目录
const DIST = path.join(ROOT, 'dist')
const PKG = require(path.join(ROOT, 'package.json'))
const ZIP_PATH = path.join(ROOT, `plugin-forge-browser-${PKG.version}.zip`)

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

  console.log('[package] 注入 manifest.json / background.js ...')
  fs.copyFileSync(path.join(ROOT, 'manifest.json'), path.join(DIST, 'manifest.json'))
  fs.copyFileSync(path.join(ROOT, 'background.js'), path.join(DIST, 'background.js'))

  console.log('[package] 注入 icons ...')
  copyDir(path.join(ROOT, 'icons'), path.join(DIST, 'icons'))

  console.log('[package] 打包 zip ...')
  const zip = new AdmZip()
  zip.addLocalFolder(DIST, '')
  zip.writeZip(ZIP_PATH)

  console.log('[package] 完成:', ZIP_PATH)
}

main()
