# 项目总览

**Plugin Forge** 是一个多平台插件开发模板：用一份 Vue 3 Web 内核，同时产出四种形态的插件。所有处理在本地完成，无需后端服务。

## 四种形态对比

| 形态 | 目录 | 运行环境 | 打包产物 | 安装方式 |
| --- | --- | --- | --- | --- |
| Web 应用 | `plugin-forge/` | 浏览器 | `dist/`（静态文件） | 直接访问 / 部署到静态托管 |
| 浏览器插件 | `plugin-forge-browser/` | Chrome / Edge（MV3） | `dist/` + `.zip` | `chrome://extensions` 加载已解压 |
| VSCode 插件 | `plugin-forge-vscode/` | VSCode ≥ 1.85 | `.vsix` | 扩展面板「从 VSIX 安装」 |
| uTools 插件 | `plugin-forge-utools/` | uTools ≥ 5.0 | `dist/` → `.upxs` | 开发者工具打包后安装 |

## 技术栈

| 形态 | 技术栈 |
| --- | --- |
| Web 应用 | Vue 3.5 / Vite 8 / Pinia / Element Plus / Vue Router |
| 浏览器插件 | Chromium MV3（manifest v3 + service worker） |
| VSCode 插件 | TypeScript + esbuild（扩展端）/ @vscode/vsce（打包） |
| uTools 插件 | plugin.json（uTools 清单）+ uTools 开发者工具 |

## 模板结构

```
plugin-forge/
├── plugin-forge/         # Web 应用（Vue 3 + Vite + Element Plus）
├── plugin-forge-browser/ # 浏览器插件（Chrome / Edge，MV3）
├── plugin-forge-vscode/  # VSCode 插件（扩展外壳 + Webview 内嵌）
├── plugin-forge-utools/  # uTools 插件（plugin.json + Web 嵌入）
├── plugin-forge-doc/     # 文档站点（VitePress）
├── LICENSE
└── README.md
```

## 内置页面

模板默认保留三个页面作为骨架：

- **首页**：模板定位与四种形态介绍
- **关于**：三方库清单
- **变量格式转换**：示例工具页，展示如何编写一个完整的工具视图

## 扩展新工具

1. 在 `plugin-forge/src/views/` 下新建页面组件（参照 `VariableConvertView.vue`）
2. 在 `plugin-forge/src/router/index.js` 注册路由
3. 在 `plugin-forge/src/menu.js` 添加菜单项
4. 浏览器 / VSCode / uTools 三个插件会自动继承新页面（它们均构建同一份内核）

## 许可证

MIT