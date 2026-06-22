<template>
  <el-dialog
    v-model="visible"
    title="详情预览"
    width="900px"
    :close-on-click-modal="false"
  >
    <div class="preview-content">
      <!-- 自由布局预览 -->
      <div class="preview-canvas">
        <div
          v-for="field in fields"
          :key="field.key"
          class="preview-field"
          :style="{
            left: field.x + 'px',
            top: field.y + 'px',
            width: field.width + 'px',
            minHeight: field.height + 'px'
          }"
        >
          <div class="field-label">{{ field.name }}</div>
          <div class="field-value">{{ sampleData[field.key] || '-' }}</div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  // 字段列表
  fields: {
    type: Array,
    default: () => []
  },
  // 示例数据
  sampleData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

// 对话框显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 关闭对话框
const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.preview-content {
  padding: 20px;
  min-height: 400px;

  .preview-canvas {
    position: relative;
    min-height: 500px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;

    .preview-field {
      position: absolute;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .field-label {
        font-size: 13px;
        color: var(--text-secondary);
        font-weight: 500;
      }

      .field-value {
        font-size: 14px;
        color: var(--text-primary);
        word-break: break-all;
      }
    }
  }
}
</style>
