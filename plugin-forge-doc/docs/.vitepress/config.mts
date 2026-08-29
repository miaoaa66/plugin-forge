import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Plugin Forge 文档',
  description: '多平台插件开发模板：一套 Web 内核，四种形态交付',
  head: [['link', { rel: 'icon', href: '/logo.png' }]],
  cleanUrls: true,
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '项目总览', link: '/guide/overview' },
    ],
    sidebar: [
      {
        text: '项目总览',
        items: [
          { text: '项目总览', link: '/guide/overview' },
          { text: 'Web 应用', link: '/guide/web' },
          { text: '浏览器插件', link: '/guide/browser' },
          { text: 'VSCode 插件', link: '/guide/vscode' },
          { text: 'uTools 插件', link: '/guide/utools' },
        ],
      },
    ],
    search: {
      provider: 'local',
    },
    outline: {
      label: '本页目录',
      level: [2, 3],
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    lastUpdated: {
      text: '最后更新于',
    },
  },
})