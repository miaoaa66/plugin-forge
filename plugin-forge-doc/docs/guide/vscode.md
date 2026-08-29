# VSCode 插件

`plugin-forge-vscode/` 把 Plugin Forge 内核嵌入 VSCode，作为多平台插件开发模板的 VSCode 形态。

## 使用方式

安装后默认显示在**底部面板**（与「输出 / 终端 / 问题」同一栏，多出一个「Plugin Forge」标签），点击即可打开。

也可以把视图**拖到主侧边栏**或**辅助侧边栏**（VSCode 1.85+）使用：

- 在面板 tab 上右键 → **Move to** → Primary Side Bar / Secondary Side Bar
- 或直接拖动 tab

命令面板：`Plugin Forge: 打开`

## 开发与打包

```bash
npm install        # 安装依赖
npm run package    # 构建 plugin-forge 并打包成 .vsix
npm run sync       # 仅重新构建 / 拷贝 webview 产物（不打包）
npm run build      # 仅重新打包扩展端 TS
```

打包产物为 `plugin-forge-vscode-<version>.vsix`，在 VSCode 扩展面板「从 VSIX 安装」即可。

开发调试：用 VSCode 打开本目录，按 **F5** 启动 Extension Development Host（已配好 `.vscode/launch.json`）。

## 系统要求

- VSCode **1.85** 及以上（辅助侧边栏从该版本开始支持）
- 无运行时依赖，所有资源打包在扩展内

## 能力桥接与受限差异

由于 VSCode Webview 的沙箱限制，部分浏览器能力不可用，扩展做了如下适配：

| 功能 | 状态 | 说明 |
| --- | --- | --- |
| 文件下载 | ✅ 桥接 | 通过系统保存对话框，扩展端写入文件 |
| 文件上传 / 拖拽 | ✅ 桥接 | 通过系统打开对话框，扩展端读取后回传 |
| 剪贴板 | ✅ 桥接 | 走扩展端 `env.clipboard` |
| 路由、主题、菜单搜索 | ✅ 完全可用 | 无需改动 |
| 全屏按钮 | 🚫 已移除 | Webview 内 `requestFullscreen` 不可用 |