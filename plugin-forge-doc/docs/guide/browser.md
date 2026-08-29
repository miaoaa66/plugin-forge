# 浏览器插件

`plugin-forge-browser/` 是 Plugin Forge 的**浏览器插件形态**：点击工具栏图标，在新标签页打开插件内核。基于 Chromium 的 **Chrome / Edge** 可用。

## 打包

```bash
cd plugin-forge-browser
npm install
npm run package
```

产物：

- `dist/` —— 可加载目录（供「加载已解压的扩展」使用）
- `plugin-forge-browser-<version>.zip` —— 分发用压缩包

## 安装（开发者模式）

1. 地址栏打开 `chrome://extensions`（Edge 为 `edge://extensions`）。
2. 打开右上角「开发者模式」。
3. 点「加载已解压的扩展程序」，选择 `dist/` 目录。
4. 点击浏览器工具栏的 Plugin Forge 图标，即可在新标签页打开内核。

> 提示：zip 分发包需先解压，再按第 3 步加载解压后的目录。

## 技术栈

- Chromium MV3（manifest v3 + service worker）