<template>
  <button class="menu-search-trigger" title="搜索菜单" @click.stop="open">
    <el-icon :size="18"><Search /></el-icon>
  </button>

  <el-dialog
    v-model="visible"
    :show-close="false"
    width="600px"
    top="8vh"
    append-to-body
    class="menu-search-dialog"
    @opened="onOpened"
    @closed="onClosed"
  >
    <div class="menu-search">
      <el-input
        ref="inputRef"
        v-model="keyword"
        class="menu-search-input"
        size="large"
        placeholder="搜索"
        clearable
        @input="onInput"
        @keydown="onKeydown"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <div class="menu-search-list">
        <template v-if="results.length">
          <div
            v-for="(item, i) in results"
            :key="item.key"
            class="menu-search-item"
            :class="{ active: i === activeIndex }"
            @mouseenter="activeIndex = i"
            @click="go(item)"
          >
            <el-icon class="item-icon" :size="18">
              <component :is="item.icon || Files" />
            </el-icon>
            <span class="item-title">
              <template v-if="item.category">
                <span class="item-category">{{ item.category }}</span>
                <span class="item-sep">&gt;</span>
              </template>
              <span class="item-label">{{ item.label }}</span>
            </span>
            <svg
              v-if="i === activeIndex"
              class="item-enter"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 6v6a4 4 0 0 1-4 4H6" />
              <path d="m8 12 4-4 4 4" />
            </svg>
          </div>
        </template>
        <div v-else class="menu-search-empty">暂无搜索结果</div>
      </div>

      <div class="menu-search-footer">
        <span class="footer-hint"><span class="kbd">Enter</span>确认</span>
        <span class="footer-hint"><span class="kbd">↑</span><span class="kbd">↓</span>切换</span>
        <span class="footer-hint"><span class="kbd">Esc</span>关闭</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Files } from '@element-plus/icons-vue'
import { pinyin } from 'pinyin-pro'
import { menuList, flattenMenu } from '@/menu'

const router = useRouter()
const visible = ref(false)
const keyword = ref('')
const activeIndex = ref(0)
const inputRef = ref(null)

// 一次性预生成搜索索引：label + category + 各自拼音全拼 + 首字母
const entries = flattenMenu(menuList).map((item) => {
  const labelPinyin = pinyin(item.label, { toneType: 'none', type: 'array' }).join('')
  const labelInitials = pinyin(item.label, { pattern: 'first', toneType: 'none', type: 'array' }).join('')
  const categoryPinyin = item.category
    ? pinyin(item.category, { toneType: 'none', type: 'array' }).join('')
    : ''
  const categoryInitials = item.category
    ? pinyin(item.category, { pattern: 'first', toneType: 'none', type: 'array' }).join('')
    : ''
  return {
    ...item,
    searchText: [item.label, item.category || '', labelPinyin, labelInitials, categoryPinyin, categoryInitials]
      .join(' ')
      .toLowerCase(),
  }
})

const results = computed(() => {
  const tokens = keyword.value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  if (!tokens.length) return entries
  return entries.filter((e) => tokens.every((t) => e.searchText.includes(t)))
})

function open() {
  visible.value = true
}

function onOpened() {
  inputRef.value?.focus()
}

function onClosed() {
  keyword.value = ''
  activeIndex.value = 0
}

function onInput() {
  activeIndex.value = 0
}

function go(item) {
  router.push(item.key)
  visible.value = false
}

function onKeydown(e) {
  if (e.isComposing) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (results.value.length) {
      activeIndex.value = (activeIndex.value + 1) % results.value.length
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (results.value.length) {
      activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = results.value[activeIndex.value]
    if (item) go(item)
  }
}
</script>

<style scoped>
.menu-search-trigger {
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
  flex-shrink: 0;
}

.menu-search-trigger:hover {
  background-color: var(--toggle-bg-hover);
}

.menu-search {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.menu-search-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px;
}

.menu-search-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 16px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--el-text-color-primary);
  transition: background-color 0.15s ease;
}

.menu-search-item:hover {
  background-color: var(--el-fill-color-light);
}

.menu-search-item .item-icon {
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.menu-search-item .item-title {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  font-size: 14px;
  white-space: nowrap;
}

.menu-search-item .item-category {
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.menu-search-item .item-sep {
  color: var(--el-text-color-placeholder);
  margin: 0 6px;
  flex-shrink: 0;
}

.menu-search-item .item-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-search-item .item-enter {
  flex-shrink: 0;
  color: var(--el-color-primary);
}

.menu-search-item.active {
  background-color: var(--el-color-primary);
  color: #fff;
}

.menu-search-item.active .item-icon,
.menu-search-item.active .item-category,
.menu-search-item.active .item-sep,
.menu-search-item.active .item-label,
.menu-search-item.active .item-enter {
  color: #fff;
}

.menu-search-empty {
  padding: 40px 0;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.menu-search-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.footer-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 4px;
  background-color: var(--el-fill-color);
  border: 1px solid var(--el-border-color);
  font-size: 12px;
  line-height: 1;
  color: var(--el-text-color-regular);
}
</style>

<style>
.menu-search-dialog {
  border-radius: 12px;
  overflow: hidden;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.menu-search-dialog .el-dialog__header {
  display: none;
}

.menu-search-dialog .el-dialog__body {
  padding: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
