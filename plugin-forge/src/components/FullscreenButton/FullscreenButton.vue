<template>
  <button
    ref="buttonRef"
    class="fullscreen-btn"
    :class="{ 'is-fullscreen': isFullscreen }"
    :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
    :title="isFullscreen ? '退出全屏' : '全屏'"
    @mousedown="onMouseDown"
  >
    <!-- 全屏图标：四角向外 -->
    <svg v-if="!isFullscreen" class="fb-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M2 6V2.5A.5.5 0 0 1 2.5 2H6M14 6V2.5a.5.5 0 0 0-.5-.5H10M2 10v3.5a.5.5 0 0 0 .5.5H6M14 10v3.5a.5.5 0 0 1-.5.5H10"
        stroke="currentColor"
        stroke-width="1.6"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <!-- 退出全屏图标：四角向内 -->
    <svg v-else class="fb-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M6 2v3.5a.5.5 0 0 1-.5.5H2M10 2v3.5a.5.5 0 0 0 .5.5H14M6 14v-3.5a.5.5 0 0 0-.5-.5H2M10 14v-3.5a.5.5 0 0 1 .5-.5H14"
        stroke="currentColor"
        stroke-width="1.6"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

/**
 * 全屏/退出全屏悬浮按钮
 * - 默认 fixed 在视口右上角
 * - 可鼠标拖动改变位置（约束在视口内）
 * - 点击切换 target 元素的浏览器原生全屏状态
 * - 拖动与点击通过移动阈值区分
 */
const props = defineProps({
  // 全屏目标元素（HTMLElement），非全屏时为 null
  target: {
    type: Object,
    default: null,
  },
})

const buttonRef = ref(null)
const isFullscreen = ref(false)
const pos = ref({ x: 0, y: 20 })

// 拖动相关内部状态
let inited = false
let dragging = false
let moved = false
let startX = 0
let startY = 0
let startPosX = 0
let startPosY = 0

const DRAG_THRESHOLD = 3 // 超过该距离视为拖动，否则视为点击

function initPosition() {
  if (inited) return
  const btnW = buttonRef.value?.offsetWidth || 40
  pos.value = {
    x: window.innerWidth - btnW - 20,
    y: 20,
  }
  inited = true
}

function onMouseDown(e) {
  if (e.button !== 0) return // 仅响应左键
  dragging = true
  moved = false
  startX = e.clientX
  startY = e.clientY
  startPosX = pos.value.x
  startPosY = pos.value.y
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  e.preventDefault()
}

function onMouseMove(e) {
  if (!dragging) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
    moved = true
  }
  const btnW = buttonRef.value?.offsetWidth || 40
  const btnH = buttonRef.value?.offsetHeight || 40
  let nx = startPosX + dx
  let ny = startPosY + dy
  // 约束在视口内
  nx = Math.max(0, Math.min(nx, window.innerWidth - btnW))
  ny = Math.max(0, Math.min(ny, window.innerHeight - btnH))
  pos.value = { x: nx, y: ny }
}

function onMouseUp() {
  if (!dragging) return
  dragging = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  // 未发生明显移动则视为点击
  if (!moved) toggleFullscreen()
}

async function toggleFullscreen() {
  const el = props.target
  if (!el) return
  try {
    if (!document.fullscreenElement) {
      await el.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch (err) {
    console.warn('[FullscreenButton] 切换全屏失败:', err)
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

function onResize() {
  // 窗口尺寸变化时把按钮拉回视口内
  const btnW = buttonRef.value?.offsetWidth || 40
  const btnH = buttonRef.value?.offsetHeight || 40
  pos.value = {
    x: Math.max(0, Math.min(pos.value.x, window.innerWidth - btnW)),
    y: Math.max(0, Math.min(pos.value.y, window.innerHeight - btnH)),
  }
}

onMounted(() => {
  nextTick(initPosition)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
})
</script>

<style scoped>
.fullscreen-btn {
  position: fixed;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: var(--panel-bg);
  color: var(--content-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  user-select: none;
  -webkit-user-select: none;
  /* 不对 left/top 做 transition，保证拖动跟手 */
  transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
}

.fullscreen-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.fullscreen-btn:active {
  transform: scale(0.95);
}

.fullscreen-btn.is-fullscreen {
  background-color: var(--menu-active-bg);
  color: #ffffff;
}

/* 黑暗模式下按钮背景与内容区背景相近，加深阴影并加亮色描边以提升可见性 */
html.dark .fullscreen-btn {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12);
}

html.dark .fullscreen-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.fb-icon {
  width: 18px;
  height: 18px;
  display: block;
  pointer-events: none;
}
</style>
