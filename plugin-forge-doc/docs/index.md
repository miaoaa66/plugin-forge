---
layout: home

hero:
  name: "Plugin Forge"
  text: "多平台插件开发模板"
  tagline: 一套 Web 内核 · 四种形态交付 · 开箱即用
  image:
    src: /logo.png
    alt: Plugin Forge
  actions:
    - theme: brand
      text: 开始使用
      link: /guide/overview

features:
  - title: 一套内核四形态交付
    details: 同一份 Vue 3 Web 内核，同时产出 Web 应用、浏览器插件、VSCode 插件与 uTools 插件。
  - title: 开箱即用
    details: 内置侧边栏布局、暗色主题、菜单搜索、全屏按钮与 VSCode Webview 桥接层。
  - title: 本地离线
    details: 所有处理在本地完成，无需后端服务，数据不上传。
  - title: 示例工具
    details: 内置「变量格式转换」示例工具页，供后续开发者参照扩展新功能。
---

## 这是什么？

**Plugin Forge** 是一个多平台插件开发模板，用一份 Vue 3 内核同时产出多种平台形态：

- **Web 应用**（`plugin-forge/`）：Vue 3 + Vite + Element Plus 纯前端内核，浏览器直接使用
- **浏览器插件**（`plugin-forge-browser/`）：Chrome / Edge 扩展，点击图标在新标签页打开内核
- **VSCode 插件**（`plugin-forge-vscode/`）：把内核嵌入编辑器底部面板 / 侧边栏
- **uTools 插件**（`plugin-forge-utools/`）：搜索框唤起，独立窗口打开内核

## 快速开始

```bash
# Web 应用
cd plugin-forge
npm install
npm run dev        # 开发
npm run build      # 构建生产版本
```

## 目录导航

- [项目总览](/guide/overview)：了解四种形态与模板结构