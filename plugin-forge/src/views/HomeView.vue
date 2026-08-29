<template>
  <div class="home">
    <section class="intro">
      <h2>Plugin Forge</h2>
      <p class="subtitle">多平台插件开发模板 · 一套 Web 内核 · 四种形态交付</p>
      <p class="desc">
        Plugin Forge 是一个多平台插件开发模板：用一份 Vue 3 Web 内核，同时产出浏览器扩展、VSCode 插件、
        uTools 插件与静态文档站。内置侧边栏布局、暗色主题、菜单搜索、全屏按钮与 VSCode Webview 桥接层，
        开箱即用，把精力留给业务功能本身。
      </p>
      <div class="tags">
        <el-tag v-for="t in tags" :key="t" size="small" effect="plain">{{ t }}</el-tag>
      </div>
    </section>

    <h2 class="section-title">核心形态</h2>
    <p class="section-sub">同一份 Web 内核，打包到多个平台</p>
    <div class="forms-grid">
      <el-card v-for="item in forms" :key="item.name" class="form-card" shadow="hover">
        <div class="card-head">
          <span class="name">{{ item.name }}</span>
          <el-tag size="small" effect="plain">{{ item.pkg }}</el-tag>
        </div>
        <p class="card-desc">{{ item.desc }}</p>
      </el-card>
    </div>
  </div>
</template>

<script setup>
const tags = ['多平台', '可扩展', '本地离线', '开箱即用']

const forms = [
  {
    name: 'Web 应用',
    pkg: 'plugin-forge/',
    desc: 'Vue 3 + Vite + Element Plus 纯前端内核，浏览器直接使用。',
  },
  {
    name: '浏览器插件',
    pkg: 'plugin-forge-browser/',
    desc: 'Chrome / Edge 扩展，点击图标在新标签页打开内核。',
  },
  {
    name: 'VSCode 插件',
    pkg: 'plugin-forge-vscode/',
    desc: '把内核嵌入 VSCode，支持底部面板 / 侧边栏使用。',
  },
  {
    name: 'uTools 插件',
    pkg: 'plugin-forge-utools/',
    desc: '在 uTools 搜索框输入关键词唤起，独立窗口打开内核。',
  },
]
</script>

<style scoped>
.intro {
  margin-bottom: 32px;
}

.intro h2 {
  margin-bottom: 8px;
}

.subtitle {
  color: var(--el-color-primary);
  font-weight: 600;
  margin-bottom: 12px;
}

.desc {
  line-height: 1.8;
  margin-bottom: 12px;
  color: var(--content-text);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.section-title {
  margin-bottom: 8px;
}

.section-sub {
  color: #909399;
  font-size: 13px;
  margin-bottom: 20px;
}

.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.card-head .name {
  font-size: 15px;
  font-weight: 600;
}

.card-desc {
  line-height: 1.6;
  color: #606266;
}
</style>