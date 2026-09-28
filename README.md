# Plugin Forge

一套 Web 内核、四种形态交付的**多平台插件开发模板**。用它快速搭建自己的插件项目，一次开发，同时产出 Web 应用、浏览器插件、VSCode 插件与 uTools 插件。

> 模板内置三个页面作为示例骨架：首页、关于、变量格式转换。开发者可参照 `变量格式转换` 页扩充自己的工具。

## 四种形态

| 形态 | 目录 | 运行环境 | 打包产物 |
| --- | --- | --- | --- |
| Web 应用 | `plugin-forge/` | 浏览器 | `dist/`（静态文件） |
| 浏览器插件 | `plugin-forge-browser/` | Chrome / Edge（MV3） | `dist/` + `.zip` |
| VSCode 插件 | `plugin-forge-vscode/` | VSCode ≥ 1.85 | `.vsix` |
| uTools 插件 | `plugin-forge-utools/` | uTools ≥ 5.0 | `.upxs` |

所有形态共享同一份 Web 内核，本地运行、数据不上传。

## 目录结构

```
plugin-forge/
├── plugin-forge/          # Web 内核（Vue 3 + Vite + Element Plus）
├── plugin-forge-browser/  # 浏览器插件（Chrome / Edge，MV3）
├── plugin-forge-vscode/   # VSCode 插件（扩展外壳 + Webview 内嵌）
├── plugin-forge-utools/   # uTools 插件（plugin.json + Web 嵌入）
├── plugin-forge-doc/      # 文档站点（VitePress）
├── LICENSE
└── README.md
```

## 快速开始

### 环境要求

- Node.js ≥ 22.18.0 或 ≥ 24.12.0

我本地使用的26.7.0没有发现问题

### Web 应用

```bash
cd plugin-forge
npm install
npm run dev       # 开发服务器（端口 7011）
npm run build     # 构建生产版本
```

### 浏览器插件

```bash
cd plugin-forge-browser
npm install
npm run package   # 构建 webview 并打包成 .zip
```

产物为 `plugin-forge-browser/dist/`（可加载目录）与 `plugin-forge-browser/plugin-forge-browser-<version>.zip`（分发包）。安装方式：`chrome://extensions` 打开「开发者模式」→「加载已解压的扩展程序」→ 选择 `dist/`。

### VSCode 插件

```bash
cd plugin-forge-vscode
npm install
npm run package   # 构建 webview 并打包成 .vsix
```

打包产物为 `plugin-forge-vscode/plugin-forge-vscode-<version>.vsix`，在 VSCode 扩展面板「从 VSIX 安装」即可。

### uTools 插件

```bash
cd plugin-forge-utools
npm install
npm run package   # 构建 web 并组装 dist/（不再产 .upx）
```

产物为 `plugin-forge-utools/dist/`（核心交付物）。**uTools v5.0+ 安装包已升级为 `.upxs`（加密 + 开发者签名）**，需用「uTools 开发者工具」导入 `dist/plugin.json`，点「打包 UPXS」生成 `.upxs`，再长按 `.upxs` 右键 → 超级面板「安装插件应用」。

## 文档

基于 VitePress 的模板使用文档，介绍四种形态与如何扩展新工具：

```bash
cd plugin-forge-doc
npm install
npm run docs:dev       # 本地预览
npm run docs:build     # 构建静态站点（产物 docs/.vitepress/dist/）
```

## 技术栈

- **Web 内核**：Vue 3.5 / Vite 8 / Pinia / Element Plus / Vue Router
- **浏览器插件**：Chromium MV3（manifest v3 + service worker）
- **VSCode 插件**：TypeScript + esbuild（扩展端）/ @vscode/vsce（打包）
- **uTools 插件**：plugin.json（uTools 清单）+ uTools 开发者工具（v5.0+ 打包为加密签名的 `.upxs`，无 CLI/SDK）

## ⚠️ 仓库说明
本项目**主仓库位于 Gitee**，GitHub 为自动单向同步的只读镜像。

1. 你可以自由 Fork GitHub 上的代码副本，但所有代码提交、Bug反馈、功能建议、Pull Request，请前往 Gitee 主仓库。
2. GitHub仓库所有文件由Gitee自动同步覆盖，任何在此处的手动修改都会丢失。

👉 Gitee主仓库地址：https://gitee.com/miaoaa66/plugin-forge



## 许可证

[MIT](LICENSE)