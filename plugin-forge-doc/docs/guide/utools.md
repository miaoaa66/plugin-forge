# uTools 插件

`plugin-forge-utools/` 是 Plugin Forge 的 **uTools 插件形态**：在 uTools 搜索框输入关键词，回车后以独立窗口打开插件内核。

> **重要**：uTools **v5.0.0 起**将安装包格式升级为 **`.upxs`**（加密 + 开发者信息签名），任何普通 zip 工具生成的 `.upx` 在 v5.0.0 及之后版本均不会被识别为插件安装包。`.upxs` 只能由「uTools 开发者工具」图形界面打包生成，官方未提供命令行打包工具。

## 目录结构

```
plugin-forge-utools/
├── package.json
├── plugin.json        # uTools 插件清单（开发者工具入口）
├── preload.js         # 预加载脚本（剪贴板兜底 + 扩展点）
├── scripts/
│   └── package.js     # 组装 dist/
└── dist/              # 核心交付物：开发者工具打 .upxs 时会原样打包
    ├── plugin.json
    ├── preload.js
    ├── logo.png
    ├── index.html
    └── assets/
```

## 打包（生成 dist/）

```bash
cd plugin-forge-utools
npm install     # 当前 package.json 无第三方依赖，此步仅做幂等校验
npm run package # 构建 plugin-forge Web → 组装 dist/（不再产出 .upx）
```

- `--no-build` 跳过 Web 构建（复用 `plugin-forge/dist` 现有产物）

## 打包 .upxs（官方流程）

1. 打开「uTools 开发者工具」。
2. 新建项目 → 填应用信息、勾选协议 → 确定。
3. 「选择工程 plugin.json 文件夹」→ 选 `plugin-forge-utools/dist/plugin.json`。
4. 点「开启运行」验证。
5. 点「打包 UPXS」→ 填版本号 `0.1.0` → 另存为 `plugin-forge-utools-0.1.0.upxs`。

## 安装 .upxs

任选其一：

- **方式 A**：在文件资源管理器中，鼠标左键单击选中 `plugin-forge-utools-0.1.0.upxs`，再按**鼠标中键**（超级面板默认触发键，未修改设置时）呼出超级面板 → 点「安装插件应用」。若超级面板已关闭，改用方式 B。
- **方式 B**：复制 `.upxs` 文件，按 `Alt + Space`（uTools 默认全局快捷键，未修改设置时）呼出搜索框，粘贴 → 选「安装插件应用」。

安装时弹安全提示（离线包特性），确认即可。

## 使用

在 uTools 搜索框输入 `plugin-forge` / `插件模板` / `plugin`（中文支持拼音及首字母），回车即打开插件内核。