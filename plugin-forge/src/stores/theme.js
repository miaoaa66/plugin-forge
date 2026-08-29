import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// 预设主题颜色
export const themeColors = [
  { name: '蓝色', value: '#1890ff' },
  { name: '绿色', value: '#52c41a' },
  { name: '紫色', value: '#722ed1' },
  { name: '橙色', value: '#fa8c16' },
  { name: '红色', value: '#f5222d' },
  { name: '青色', value: '#13c2c2' },
  { name: '粉色', value: '#eb2f96' },
  { name: '金色', value: '#faad14' }
]

export const useThemeStore = defineStore('theme', () => {
  const saved = localStorage.getItem('theme')
  const isDark = ref(saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches))

  // 主题颜色
  const savedColor = localStorage.getItem('theme-color')
  const themeColor = ref(savedColor || '#1890ff')

  // 生成 Element Plus 需要的颜色变体
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  function mix(color1, color2, weight) {
    const d = hexToRgb(color1)
    const s = hexToRgb(color2)
    if (!d || !s) return color1
    const r = Math.round(d.r * weight + s.r * (1 - weight))
    const g = Math.round(d.g * weight + s.g * (1 - weight))
    const b = Math.round(d.b * weight + s.b * (1 - weight))
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  function applyThemeColor(color) {
    const html = document.documentElement
    // 设置自定义变量
    html.style.setProperty('--menu-active-bg', color)
    // 设置 Element Plus 主题色
    html.style.setProperty('--el-color-primary', color)
    html.style.setProperty('--el-color-primary-light-3', mix(color, '#ffffff', 0.7))
    html.style.setProperty('--el-color-primary-light-5', mix(color, '#ffffff', 0.5))
    html.style.setProperty('--el-color-primary-light-7', mix(color, '#ffffff', 0.3))
    html.style.setProperty('--el-color-primary-light-8', mix(color, '#ffffff', 0.2))
    html.style.setProperty('--el-color-primary-light-9', mix(color, '#ffffff', 0.1))
    html.style.setProperty('--el-color-primary-dark-2', mix(color, '#000000', 0.8))
  }

  function applyTheme() {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    // 应用主题颜色
    applyThemeColor(themeColor.value)
  }

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  function setThemeColor(color) {
    themeColor.value = color
    localStorage.setItem('theme-color', color)
    applyThemeColor(color)
  }

  watch(isDark, (val) => {
    localStorage.setItem('theme', val ? 'dark' : 'light')
    applyTheme()
  }, { immediate: true })

  return { isDark, toggleTheme, applyTheme, themeColor, setThemeColor }
})
