<template>
  <div class="layout">
    <aside class="layout-sider">
      <div class="logo" @click="handleLogoClick">
        <img alt="logo" src="@/assets/imgs/logo.png" width="32" height="32" />
        <span class="logo-text">Plugin Forge</span>
        <MenuSearch />
        <button
          class="theme-toggle"
          :title="isDark ? '切换到亮色主题' : '切换到暗色主题'"
          @click.stop="toggleTheme"
        >
          <el-icon :size="18">
            <Sunny v-if="isDark" />
            <Moon v-else />
          </el-icon>
        </button>
        <el-popover placement="bottom" :width="200" trigger="click">
          <template #reference>
            <button
              class="theme-toggle"
              title="主题颜色"
              @click.stop
            >
              <div class="color-indicator" :style="{ backgroundColor: themeColor }"></div>
            </button>
          </template>
          <div class="color-picker-panel">
            <div class="color-picker-title">选择主题颜色</div>
            <div class="color-options">
              <div
                v-for="color in themeColors"
                :key="color.value"
                class="color-option"
                :class="{ active: themeColor === color.value }"
                :style="{ backgroundColor: color.value }"
                :title="color.name"
                @click="setThemeColor(color.value)"
              ></div>
            </div>
          </div>
        </el-popover>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="side-menu"
        :background-color="'var(--sidebar-bg)'"
        :text-color="'var(--sidebar-text)'"
        :active-text-color="'var(--sidebar-text-active)'"
      >
        <template v-for="item in menuList" :key="item.key">
          <el-sub-menu v-if="item.children" :index="item.key">
            <template #title>
              <el-icon v-if="item.icon">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.label }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :key="child.key" :index="child.key">
              {{ child.label }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.key">
            <el-icon v-if="item.icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>
    <main class="layout-content" ref="contentRef">
      <FullscreenButton :target="contentRef" />
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'
import { menuList } from '@/menu'
import { useThemeStore, themeColors } from '@/stores/theme'
import FullscreenButton from '@/components/FullscreenButton/FullscreenButton.vue'
import MenuSearch from '@/components/MenuSearch/MenuSearch.vue'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

const isDark = computed(() => themeStore.isDark)
const toggleTheme = () => themeStore.toggleTheme()
const themeColor = computed(() => themeStore.themeColor)
const setThemeColor = (color) => themeStore.setThemeColor(color)

const activeMenu = computed(() => route.path)

const handleLogoClick = () => {
  router.push('/')
}

// 主内容区 DOM 引用，作为全屏按钮的目标
const contentRef = ref(null)
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.layout-sider {
  width: 260px;
  background-color: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 20px;
  color: var(--sidebar-logo-text);
  font-weight: 600;
  font-size: 16px;
  border-bottom: 1px solid var(--sidebar-logo-border);
  cursor: pointer;
}

.logo-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background-color: var(--toggle-bg);
  color: var(--sidebar-logo-text);
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 0;
}

.theme-toggle:hover {
  background-color: var(--toggle-bg-hover);
}

.color-indicator {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.color-picker-panel {
  padding: 8px;
}

.color-picker-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--content-text);
}

.color-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color-option.active {
  border: 2px solid var(--content-text);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
}

.side-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
}

.side-menu:not(.el-menu--collapse) {
  /* width: 220px; */
}

/* 二级菜单文本与一级菜单（图标后）文本左对齐：20(padding) + 24(icon) + 5(gap) = 49px */
.side-menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 49px !important;
}

.side-menu :deep(.el-menu-item.is-active) {
  background-color: var(--menu-active-bg) !important;
  color: #ffffff !important;
}

.side-menu :deep(.el-menu-item.is-active:hover) {
  background-color: var(--menu-active-bg) !important;
  color: #ffffff !important;
}

.layout-content {
  flex: 1;
  padding: 20px;
  background-color: var(--content-bg);
  color: var(--content-text);
  overflow-y: auto;
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>
