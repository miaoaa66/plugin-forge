<template>
  <div class="variable-convert">
    <el-card class="input-panel">
      <template #header>
        <div class="card-header">
          <span>输入变量</span>
          <el-button v-if="inputText" link type="primary" @click="resetInput">重置</el-button>
        </div>
      </template>
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="3"
        placeholder="输入一个变量名，支持任意格式（如 helloWorld、hello_world、hello-world、HelloWorld 等）"
      />
    </el-card>

    <div class="results-grid">
      <el-card
        v-for="item in formatList"
        :key="item.key"
        class="result-card"
      >
        <template #header>
          <div class="card-header">
            <span>{{ item.label }}</span>
            <el-button
              link
              type="primary"
              :disabled="!outputs[item.key]"
              :loading="copyingKey === item.key"
              @click="copyResult(item.key)"
            >
              复制
            </el-button>
          </div>
        </template>
        <el-input
          :model-value="outputs[item.key] || ''"
          type="textarea"
          :rows="2"
          readonly
          placeholder="输入变量后自动生成"
          class="result-textarea"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const formatList = [
  { key: 'camel',      label: '小驼峰 (camelCase)' },
  { key: 'pascal',     label: '大驼峰 (PascalCase)' },
  { key: 'snake',      label: '下划线-小 (snake_case)' },
  { key: 'snakeUpper', label: '下划线-大 (UPPER_SNAKE)' },
  { key: 'constant',   label: '常量 (CONSTANT_CASE)' },
  { key: 'kebab',      label: '连字符 (kebab-case)' },
  { key: 'wordsLower', label: '分词-小 (lower words)' },
  { key: 'wordsUpper', label: '分词-大 (UPPER WORDS)' },
  { key: 'title',      label: '首字母大写分词 (Title Case)' },
]

const inputText = ref('')
const outputs = reactive(Object.fromEntries(formatList.map(f => [f.key, ''])))
const copyingKey = ref('')

function splitWords(str) {
  if (!str) return []
  // 将常见分隔符统一为空格
  const normalized = str
    .replace(/[_-]+/g, ' ')
    // 在小写→大写交界处插入空格（helloWorld → hello World）
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // 连续大写后接小写时，在最后一个大写前插入空格（HELLOWorld → HELLO World）
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
  if (!normalized) return []
  return normalized.split(' ')
}

function convert(words) {
  if (!words.length) {
    formatList.forEach(f => (outputs[f.key] = ''))
    return
  }
  const lower = words.map(w => w.toLowerCase())
  const upper = words.map(w => w.toUpperCase())

  outputs.camel      = lower[0] + lower.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
  outputs.pascal     = lower.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
  outputs.snake      = lower.join('_')
  outputs.snakeUpper = upper.join('_')
  outputs.constant    = upper.join('_')
  outputs.kebab      = lower.join('-')
  outputs.wordsLower = lower.join(' ')
  outputs.wordsUpper = upper.join(' ')
  outputs.title      = lower.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

watch(inputText, (val) => {
  const words = splitWords(val)
  convert(words)
})

function resetInput() {
  inputText.value = ''
}

async function copyResult(key) {
  const text = outputs[key]
  if (!text) return
  copyingKey.value = key
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动选择文本复制')
  } finally {
    copyingKey.value = ''
  }
}
</script>

<style scoped>
.variable-convert {
  max-width: 1200px;
  margin: 0 auto;
}

.input-panel {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.result-textarea :deep(.el-textarea__inner) {
  font-family: monospace;
  font-size: 13px;
}

@media (max-width: 900px) {
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>
