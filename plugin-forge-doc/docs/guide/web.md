# Web 应用

`plugin-forge/` 是 Plugin Forge 的**核心内核**：一个纯前端、本地离线可用的 Vue 3 Web 应用，是其余三种插件形态的内容来源。

## 特性

- 完全本地运行，无需网络连接，数据不上传
- 内置侧边栏布局、暗色主题、主题色切换、菜单搜索、全屏按钮
- 内置 VSCode Webview 桥接层（下载 / 文件选择 / 剪贴板 / 全屏降级）
- 基于 Vue 3 + Vite，响应快速

## 技术栈

- **前端框架**：Vue 3.5
- **构建工具**：Vite 8
- **状态管理**：Pinia
- **UI 组件**：Element Plus
- **路由**：Vue Router（hash 路由）

## 环境要求

- Node.js ≥ 22.18.0 或 ≥ 24.12.0

## 快速开始

```bash
cd plugin-forge
npm install        # 安装依赖
npm run dev        # 启动开发服务器（端口 7011）
npm run build      # 构建生产版本
npm run preview    # 预览生产版本
npm run lint       # 代码检查并自动修复
```

## 项目结构

```
src/
├── components/       # 公共组件（FullscreenButton / MenuSearch）
├── views/            # 页面视图（HomeView / AboutView / VariableConvertView）
├── router/           # 路由配置
├── stores/           # 状态管理（theme）
├── vscode/           # VSCode Webview 适配层（能力桥接）
└── assets/           # 静态资源
```

## 相关项目

本项目同时是 [VSCode 插件](./vscode)、[浏览器插件](./browser)、[uTools 插件](./utools) 的 Webview 内容来源，构建产物会被打包进这些插件。