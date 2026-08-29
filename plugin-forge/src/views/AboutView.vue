<template>
  <div class="">
    <h2>About</h2>
    <p>Plugin Forge 是一个多平台插件开发模板：用一份 Vue 3 Web 内核，同时产出浏览器插件、VSCode 插件、uTools 插件与文档站。所有功能均在本机运行，无需后端服务。</p>
    <p>以下为本项目使用的三方库：</p>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="name" label="名称" width="300" />
      <el-table-column prop="desc" label="描述" />
      <el-table-column prop="url" label="地址">
        <template #default="scope">
          <el-link type="primary" :href="scope.row.url" target="_blank">{{ scope.row.url }}</el-link>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tableData = ref([
  // 核心框架
  {
    name: 'vue',
    desc: '核心框架，驱动项目 UI 与响应式数据',
    url: 'https://vuejs.org/',
  },
  {
    name: 'vue-router',
    desc: '官方路由，管理多页面切换与导航',
    url: 'https://router.vuejs.org/zh/',
  },
  {
    name: 'pinia',
    desc: '状态管理，集中管理应用共享状态',
    url: 'https://pinia.vuejs.org/zh/introduction.html',
  },
  // UI 组件
  {
    name: 'element-plus',
    desc: '桌面端 UI 组件库（表格、表单、弹窗等）',
    url: 'https://element-plus.org/',
  },
  {
    name: '@element-plus/icons-vue',
    desc: 'Element Plus 配套图标库',
    url: 'https://www.npmjs.com/package/@element-plus/icons-vue',
  },
  {
    name: 'pinyin-pro',
    desc: '中文转拼音，菜单搜索支持拼音/首字母匹配',
    url: 'https://www.npmjs.com/package/pinyin-pro',
  },
  // 构建与质量
  {
    name: 'vite',
    desc: '构建工具与开发服务器',
    url: 'https://cn.vitejs.dev/',
  },
  {
    name: '@vitejs/plugin-vue',
    desc: 'Vite 的 Vue 单文件组件编译插件',
    url: 'https://www.npmjs.com/package/@vitejs/plugin-vue',
  },
  {
    name: 'eslint',
    desc: 'JS 代码规范检查与自动修复',
    url: 'https://eslint.org/',
  },
  {
    name: 'oxlint',
    desc: '基于 Rust 的高性能代码检查器',
    url: 'https://oxc.rs/docs/guide/usage/linter',
  },
])
</script>

<style scoped>
h2 {
  margin-bottom: 20px;
}

p {
  margin-bottom: 20px;
}
</style>