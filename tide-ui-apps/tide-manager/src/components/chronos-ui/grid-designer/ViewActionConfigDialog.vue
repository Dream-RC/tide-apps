<template>
  <el-drawer
    v-model="visible"
    :title="dialogTitle"
    size="100%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="view-action-config">
      <!-- 左侧：字段列表 -->
      <div class="fields-panel">
        <div class="panel-header">
          <h4>表单字段</h4>
          <el-input
            v-model="fieldSearchKeyword"
            placeholder="搜索字段"
            size="small"
            clearable
            style="margin-top: 8px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="fields-list">
          <div
            v-for="field in filteredFields"
            :key="field.key"
            class="field-item"
            draggable="true"
            @dragstart="handleFieldDragStart($event, field)"
          >
            <el-icon class="drag-handle"><Rank /></el-icon>
            <span class="field-label">{{ field.name }}</span>
            <el-tag size="small" type="info">{{ field.type }}</el-tag>
          </div>
        </div>
      </div>

      <!-- 右侧：画布区域 -->
      <div class="canvas-panel">
        <div class="panel-header">
          <h4>{{ props.actionType === 'edit' ? '表单布局' : '详情布局' }}</h4>
          <div class="header-actions">
            <el-button size="small" @click="handlePreview">
              <el-icon><View /></el-icon>
              预览
            </el-button>
            <el-button size="small" @click="handleClearCanvas">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>
        </div>

        <div class="canvas-content" @drop="handleCanvasDrop" @dragover.prevent>
          <!-- 空状态提示 -->
          <div v-if="canvasFields.length === 0" class="canvas-empty-placeholder">
            <el-icon :size="48" color="#c0c4cc"><Grid /></el-icon>
            <p class="empty-title">拖拽左侧字段到此处</p>
            <p class="empty-hint">可以自由放置字段位置和调整大小</p>
          </div>

          <!-- 自由布局的字段 -->
          <div
            v-for="(field, index) in canvasFields"
            :key="field.id"
            class="canvas-field-free"
            :style="{
              left: field.x + 'px',
              top: field.y + 'px',
              width: field.width + 'px',
              height: field.height + 'px'
            }"
            @mousedown="handleFieldMouseDown($event, index)"
          >
            <div class="field-header">
              <el-icon class="drag-handle"><Rank /></el-icon>
              <span class="field-label">{{ field.name }}</span>
              <div class="field-actions">
                <el-button
                  size="small"
                  text
                  type="primary"
                  @click.stop="handleEditField(field, index)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  size="small"
                  text
                  type="danger"
                  @click.stop="handleRemoveField(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="field-content">
              <el-tag size="small">{{ field.type }}</el-tag>
            </div>
            <!-- 调整大小的手柄 -->
            <div class="resize-handle" @mousedown.stop="handleResizeMouseDown($event, index)"></div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>

    <!-- 字段编辑对话框 -->
    <el-dialog
      v-model="fieldEditDialogVisible"
      title="编辑字段"
      width="500px"
      append-to-body
    >
      <el-form v-if="editingField" label-width="100px">
        <el-form-item label="字段名称">
          <el-input v-model="editingField.name" />
        </el-form-item>
        <el-form-item label="宽度">
          <el-input-number v-model="editingField.width" :min="200" :max="800" :step="10" />
          <span class="size-hint">px</span>
        </el-form-item>
        <el-form-item label="高度">
          <el-input-number v-model="editingField.height" :min="60" :max="400" :step="10" />
          <span class="size-hint">px</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fieldEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveFieldEdit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <ViewActionPreviewDialog
      v-model="previewDialogVisible"
      :fields="canvasFields"
      :sample-data="sampleData"
    />
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Rank, View, Delete, Grid, Edit } from '@element-plus/icons-vue'
import ViewActionPreviewDialog from './ViewActionPreviewDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  // 操作类型：view（查看）或 edit（编辑）
  actionType: {
    type: String,
    default: 'view',
    validator: (value) => ['view', 'edit'].includes(value)
  },
  // 可用字段列表
  fields: {
    type: Array,
    default: () => []
  },
  // 当前配置
  config: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// 对话框标题
const dialogTitle = computed(() => {
  return props.actionType === 'edit' ? '配置编辑表单' : '配置查看详情'
})

// 对话框显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 字段搜索关键词
const fieldSearchKeyword = ref('')

// 处理字段拖拽开始
const handleFieldDragStart = (e, field) => {
  console.log('开始拖拽字段:', field)
  e.dataTransfer.effectAllowed = 'copy'
  e.dataTransfer.setData('application/json', JSON.stringify(field))
}

// 过滤后的字段列表
const filteredFields = computed(() => {
  if (!fieldSearchKeyword.value) {
    return props.fields.filter(f => !f.isSystemField)
  }
  const keyword = fieldSearchKeyword.value.toLowerCase()
  return props.fields.filter(field => 
    !field.isSystemField &&
    (field.name.toLowerCase().includes(keyword) || 
    field.key.toLowerCase().includes(keyword))
  )
})

// 画布字段列表
const canvasFields = ref([])

// 字段ID计数器
let fieldIdCounter = 0

// 拖拽和调整大小的状态
const draggingField = ref(null)
const resizingField = ref(null)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartFieldX = ref(0)
const dragStartFieldY = ref(0)
const resizeStartWidth = ref(0)
const resizeStartHeight = ref(0)

// 克隆字段（从左侧拖拽到右侧时）
const cloneField = (field) => {
  return {
    ...field,
    id: `field_${Date.now()}_${fieldIdCounter++}`,
    x: 50, // 默认位置
    y: 50 + canvasFields.value.length * 80, // 错开位置
    width: 300,
    height: 80
  }
}

// 处理画布的 drop 事件
const handleCanvasDrop = (e) => {
  e.preventDefault()
  
  // 获取拖拽的字段数据
  const fieldData = e.dataTransfer.getData('application/json')
  if (!fieldData) return
  
  try {
    const field = JSON.parse(fieldData)
    console.log('拖拽到画布的字段:', field)
    
    const canvasRect = e.currentTarget.getBoundingClientRect()
    
    // 计算相对于画布的位置
    const x = e.clientX - canvasRect.left - 150 // 减去一半宽度，让鼠标在中心
    const y = e.clientY - canvasRect.top - 40 // 减去一半高度
    
    // 添加字段到画布
    const newField = {
      ...field,
      id: `field_${Date.now()}_${fieldIdCounter++}`,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: 300,
      height: 80
    }
    console.log('添加到画布的字段:', newField)
    canvasFields.value.push(newField)
  } catch (error) {
    console.error('解析字段数据失败:', error)
  }
}

// 字段拖拽开始
const handleFieldMouseDown = (e, index) => {
  if (e.target.closest('.field-actions') || e.target.closest('.resize-handle')) {
    return
  }
  
  draggingField.value = index
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  dragStartFieldX.value = canvasFields.value[index].x
  dragStartFieldY.value = canvasFields.value[index].y
  
  document.addEventListener('mousemove', handleFieldMouseMove)
  document.addEventListener('mouseup', handleFieldMouseUp)
  
  e.preventDefault()
}

// 字段拖拽移动
const handleFieldMouseMove = (e) => {
  if (draggingField.value !== null) {
    const deltaX = e.clientX - dragStartX.value
    const deltaY = e.clientY - dragStartY.value
    
    canvasFields.value[draggingField.value].x = Math.max(0, dragStartFieldX.value + deltaX)
    canvasFields.value[draggingField.value].y = Math.max(0, dragStartFieldY.value + deltaY)
  } else if (resizingField.value !== null) {
    const deltaX = e.clientX - dragStartX.value
    const deltaY = e.clientY - dragStartY.value
    
    canvasFields.value[resizingField.value].width = Math.max(200, resizeStartWidth.value + deltaX)
    canvasFields.value[resizingField.value].height = Math.max(60, resizeStartHeight.value + deltaY)
  }
}

// 字段拖拽结束
const handleFieldMouseUp = () => {
  draggingField.value = null
  resizingField.value = null
  
  document.removeEventListener('mousemove', handleFieldMouseMove)
  document.removeEventListener('mouseup', handleFieldMouseUp)
}

// 调整大小开始
const handleResizeMouseDown = (e, index) => {
  resizingField.value = index
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  resizeStartWidth.value = canvasFields.value[index].width
  resizeStartHeight.value = canvasFields.value[index].height
  
  document.addEventListener('mousemove', handleFieldMouseMove)
  document.addEventListener('mouseup', handleFieldMouseUp)
  
  e.preventDefault()
}

// 清空画布
const handleClearCanvas = () => {
  canvasFields.value = []
  ElMessage.success('已清空画布')
}

// 移除字段
const handleRemoveField = (index) => {
  canvasFields.value.splice(index, 1)
}

// 字段编辑对话框
const fieldEditDialogVisible = ref(false)
const editingField = ref(null)
const editingFieldIndex = ref(-1)

// 编辑字段
const handleEditField = (field, index) => {
  editingField.value = { ...field }
  editingFieldIndex.value = index
  fieldEditDialogVisible.value = true
}

// 保存字段编辑
const handleSaveFieldEdit = () => {
  if (editingFieldIndex.value >= 0 && editingField.value) {
    // 更新画布中的字段
    Object.assign(canvasFields.value[editingFieldIndex.value], editingField.value)
    ElMessage.success('字段配置已更新')
  }
  fieldEditDialogVisible.value = false
  editingField.value = null
  editingFieldIndex.value = -1
}

// 预览对话框
const previewDialogVisible = ref(false)

// 示例数据（用于预览）
const sampleData = computed(() => {
  const data = {}
  canvasFields.value.forEach(field => {
    data[field.key] = `示例${field.name}`
  })
  return data
})

// 预览
const handlePreview = () => {
  if (canvasFields.value.length === 0) {
    ElMessage.warning('请先添加字段')
    return
  }
  previewDialogVisible.value = true
}

// 保存配置
const handleSave = () => {
  if (canvasFields.value.length === 0) {
    ElMessage.warning('请至少添加一个字段')
    return
  }

  console.log('保存配置 - 画布字段:', canvasFields.value)

  const config = {
    layout: 'free', // 自由布局
    fields: canvasFields.value.map(field => ({
      key: field.key,
      name: field.name,
      type: field.type,
      x: field.x,
      y: field.y,
      width: field.width,
      height: field.height
    }))
  }

  console.log('保存配置 - 最终配置:', config)
  emit('save', config)
  ElMessage.success('配置已保存')
  handleClose()
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 监听配置变化和对话框打开状态，初始化画布
watch([() => props.config, () => props.modelValue, () => props.actionType], ([newConfig, isVisible, actionType]) => {
  // 只在对话框打开时初始化
  if (isVisible) {
    if (newConfig && newConfig.fields && Array.isArray(newConfig.fields)) {
      canvasFields.value = newConfig.fields.map((field, index) => ({
        ...field,
        id: `field_${Date.now()}_${index}`,
        x: field.x || 50,
        y: field.y || (50 + index * 80),
        width: field.width || 300,
        height: field.height || 80
      }))
    } else {
      // 对话框打开但没有配置，清空画布
      canvasFields.value = []
    }
  }
}, { immediate: true, deep: true })
</script>

<style lang="scss" scoped>
.view-action-config {
  display: flex;
  gap: 20px;
  height: calc(100vh - 120px); // 全屏抽屉，减去头部和底部的高度

  .fields-panel,
  .canvas-panel {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-card);
    overflow: hidden;
  }

  .fields-panel {
    width: 320px;
    flex-shrink: 0;
  }

  .canvas-panel {
    flex: 1;
    min-width: 0; // 防止 flex 子元素溢出
  }

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-secondary);

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .header-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
  }

  .fields-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .field-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      cursor: move;
      transition: all 0.2s;

      &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &:active {
        opacity: 0.6;
      }

      .drag-handle {
        color: var(--text-tertiary);
        font-size: 16px;
      }

      .field-label {
        flex: 1;
        font-size: 14px;
        color: var(--text-primary);
      }
    }
  }

  .canvas-content {
    flex: 1;
    overflow: auto;
    padding: 0;
    position: relative;
    background: var(--bg-secondary);
    border: 2px dashed var(--border-color);
    border-radius: 8px;
    margin: 20px;
    min-height: calc(100vh - 280px); // 确保画布有足够的高度

    &:hover {
      border-color: var(--primary-color-light);
    }

    .canvas-empty-placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;

      .empty-title {
        font-size: 16px;
        color: var(--text-secondary);
        margin: 16px 0 8px 0;
        font-weight: 500;
      }

      .empty-hint {
        font-size: 14px;
        color: var(--text-tertiary);
        margin: 0;
      }
    }

    .canvas-field-free {
      position: absolute;
      background: var(--bg-card);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      padding: 12px;
      cursor: move;
      transition: box-shadow 0.2s;
      user-select: none;

      &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10;
      }

      .field-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--border-color);

        .drag-handle {
          color: var(--text-tertiary);
          font-size: 16px;
          cursor: move;

          &:hover {
            color: var(--primary-color);
          }
        }

        .field-label {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .field-actions {
          display: flex;
          gap: 4px;
        }
      }

      .field-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .resize-handle {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 16px;
        height: 16px;
        cursor: nwse-resize;
        background: linear-gradient(135deg, transparent 50%, var(--primary-color) 50%);
        border-bottom-right-radius: 6px;

        &:hover {
          background: linear-gradient(135deg, transparent 50%, var(--primary-color-hover) 50%);
        }
      }
    }
  }
}

.size-hint {
  margin-left: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-card);
}
</style>
