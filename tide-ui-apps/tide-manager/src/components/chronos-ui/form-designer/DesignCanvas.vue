<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import { toast } from 'vue-sonner'
import { useFormDesignerStore } from '@/store/modules/formDesigner'
import FormComponentRenderer from './FormComponentRenderer.vue'
import ContainerRenderer from './ContainerRenderer.vue'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/chronos-ui/Icon'
import { Label } from '@/components/ui/label'

const formDesignerStore = useFormDesignerStore()

// 拖拽相关状态
const dragOverIndex = ref(-1)
const isDragOver = ref(false)
const forceUpdateKey = ref(0)
const draggingIndex = ref<number | null>(null)
const isInternalDragging = ref(false)
const isDropping = ref(false) // 标记是否正在处理 drop 事件

// 调整大小相关状态
const resizingIndex = ref<number | null>(null)
const resizeStartX = ref(0)
const resizeStartSpan = ref(12)
const componentsListEl = ref<HTMLElement | null>(null)
const isResizing = ref(false)
const resizeBadgeSpan = ref<number | null>(null)

// 计算属性
const components = computed(() => {
  const comps = formDesignerStore.currentForm.components
  return comps
})
const selectedComponentId = computed(() => formDesignerStore.selectedComponentId)
const labelPosition = computed(() => formDesignerStore.currentForm.labelPosition || 'right')
const labelWidth = computed(() => formDesignerStore.currentForm.labelWidth || '120px')

// 计算是否显示拖拽遮罩：只在非内部拖拽时显示
const showDragOverlay = computed(() => {
  return isDragOver.value && !isInternalDragging.value
})

// 监听组件列表变化
watch(
  () => formDesignerStore.currentForm.components,
  () => {
    // 强制更新组件列表显示
    forceUpdateKey.value++
  },
  { deep: true, immediate: true }
)

// 计算每列宽度（近似）
const getColumnWidth = (): number => {
  const container = componentsListEl.value
  if (!container) return 1
  const styles = getComputedStyle(container)
  const gap = parseFloat(styles.gap || '0')
  const totalGap = gap * 23
  const width = container.clientWidth - totalGap
  return Math.max(1, width / 24)
}

// 根据鼠标位置计算目标span（相对于组件左边缘）
const calcSpanByPointer = (index: number, clientX: number): number => {
  const container = document.querySelector(
    `.component-wrapper[data-idx='${index}'] .component-container`
  ) as HTMLElement | null
  const perCol = getColumnWidth()
  if (!container || perCol <= 0) return 24
  const rect = container.getBoundingClientRect()
  const relX = clientX - rect.left
  const cols = Math.round(relX / perCol)
  return Math.min(24, Math.max(1, cols))
}

// 开始调整大小
const handleResizeStart = (index: number, event: MouseEvent) => {
  event.stopPropagation()
  resizingIndex.value = index
  resizeStartX.value = event.clientX
  const comp = components.value[index]
  resizeStartSpan.value = (comp.span ?? 24)
  isResizing.value = true
  resizeBadgeSpan.value = comp.span ?? 24
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', handleResizing)
  window.addEventListener('mouseup', handleResizeEnd)
}

// 调整过程中
const handleResizing = (event: MouseEvent) => {
  if (resizingIndex.value === null) return
  const index = resizingIndex.value
  const comp = components.value[index]
  const nextSpan = calcSpanByPointer(index, event.clientX)
  if (nextSpan !== (comp.span ?? 24)) {
    formDesignerStore.updateComponent(comp.id, { span: nextSpan } as any)
  }
  resizeBadgeSpan.value = nextSpan
}

// 结束调整
const handleResizeEnd = () => {
  window.removeEventListener('mousemove', handleResizing)
  window.removeEventListener('mouseup', handleResizeEnd)
  resizingIndex.value = null
  isResizing.value = false
  resizeBadgeSpan.value = null
  document.body.style.userSelect = ''
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleResizing)
  window.removeEventListener('mouseup', handleResizeEnd)
})

// 拖拽进入
const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()

  // 如果正在处理 drop 事件，不设置 isDragOver，防止在 drop 之后重新显示覆盖层
  if (isDropping.value) {
    return
  }

  // 检查是否是内部拖拽（通过 dataTransfer types 判断，因为 dragover 时无法读取数据）
  const hasInternalReorder = event.dataTransfer?.types.includes('internal-reorder')
  const hasComponentId = event.dataTransfer?.types.includes('componentId') || event.dataTransfer?.types.includes('componentid')

  // 如果是内部排序拖拽（从容器内拖到画布主区域），需要设置 isInternalDragging 和 isDragOver
  // 注意：即使检测到容器区域，如果是内部拖拽，也应该允许显示辅助线
  if (hasInternalReorder || hasComponentId) {
    // 从容器内拖出组件，设置内部拖拽状态
    if (!isInternalDragging.value) {
      isInternalDragging.value = true
    }
    // 内部排序拖拽，不显示外部添加遮罩，但需要设置 isDragOver 以显示辅助线
    formDesignerStore.setDragState(true)
    isDragOver.value = true
    return
  }

  // 如果是容器内的拖拽区域，不显示覆盖层
  const isContainerArea = isContainerDropArea(event)
  if (isContainerArea) {
    isDragOver.value = false
    dragOverIndex.value = -1
    return
  }

  // 对于新组件拖拽（非内部拖拽），设置 isDragOver
  // 确保 isInternalDragging 为 false，避免内部拖拽时显示遮罩
  if (!isInternalDragging.value) {
    formDesignerStore.setDragState(true)
    isDragOver.value = true
  }
}

// 检查是否是容器内的拖拽区域（使用事件路径检查，因为event.target可能指向覆盖层）
const isContainerDropArea = (event: DragEvent): boolean => {
  // 使用事件路径检查，因为event.target可能指向覆盖层
  const path = event.composedPath ? event.composedPath() : []
  // 检查路径中是否有容器内的拖拽区域
  for (const el of path) {
    if (el instanceof HTMLElement) {
      if (el.classList.contains('container-content') ||
        el.classList.contains('tab-content') ||
        el.classList.contains('grid-column')) {
        return true
      }
    }
  }
  // 如果路径中没有找到，尝试使用document.elementFromPoint检查鼠标位置下的元素
  const elementAtPoint = document.elementFromPoint(event.clientX, event.clientY)
  if (elementAtPoint instanceof HTMLElement) {
    const closest = elementAtPoint.closest('.container-content, .tab-content, .grid-column')
    if (closest) {
      return true
    }
  }
  return false
}

// 拖拽悬停
const handleDragOver = (event: DragEvent) => {
  // 如果正在处理 drop 事件，不处理 dragover，防止在 drop 之后重新设置状态
  if (isDropping.value) {
    return
  }

  // 检查是否是内部拖拽（通过 dataTransfer types 判断）
  const hasInternalReorder = event.dataTransfer?.types.includes('internal-reorder')
  const hasComponentId = event.dataTransfer?.types.includes('componentId') || event.dataTransfer?.types.includes('componentid')
  const hasComponentType = event.dataTransfer?.types.includes('componentType') || event.dataTransfer?.types.includes('componenttype')

  // 如果是内部拖拽（从容器内拖出或画布内排序），设置状态并显示辅助线
  // 注意：即使检测到容器区域，如果是内部拖拽，也应该允许显示辅助线
  if (hasInternalReorder || hasComponentId || isInternalDragging.value) {
    // 从容器内拖出组件，设置内部拖拽状态
    if (!isInternalDragging.value && (hasInternalReorder || hasComponentId)) {
      isInternalDragging.value = true
    }
    // 内部排序拖拽，确保 isDragOver 为 true 以显示辅助线
    if (!isDragOver.value) {
      isDragOver.value = true
    }
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer && (event.dataTransfer.dropEffect = 'move')
    return
  }

  // 如果是容器内的拖拽区域，不阻止事件，让容器处理，并且不显示覆盖层
  const isContainerArea = isContainerDropArea(event)
  if (isContainerArea) {
    // 隐藏覆盖层和辅助线，让事件能够到达容器内的拖拽区域
    // 对于新组件拖拽（非内部拖拽），清除遮罩和辅助线
    if (!isInternalDragging.value && hasComponentType) {
      isDragOver.value = false
    }
    dragOverIndex.value = -1
    return
  }

  // 对于新组件拖拽（非内部拖拽），如果鼠标位置在容器内，也应该清除状态
  // 使用 elementsFromPoint 进行二次检查，因为事件路径可能不准确
  if (hasComponentType && !isInternalDragging.value) {
    // 使用 elementsFromPoint 查找所有在鼠标位置下的元素，过滤掉遮罩层
    const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY)
    let closest = null

    for (const el of elementsAtPoint) {
      if (el instanceof HTMLElement) {
        // 跳过遮罩层及其子元素
        if (el.closest('.drag-overlay')) {
          continue
        }
        // 查找容器元素
        const found = el.closest('.container-content, .tab-content, .grid-column')
        if (found) {
          closest = found
          break
        }
      }
    }

    if (closest) {
      isDragOver.value = false
      dragOverIndex.value = -1
      return
    }
    // 如果不在容器内，需要设置 isDragOver 为 true
    if (!isDragOver.value) {
      isDragOver.value = true
    }
  }

  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

// 拖拽离开
const handleDragLeave = (event: DragEvent) => {
  // 只有当目标元素完全离开当前元素时才重置状态
  if (!event.relatedTarget || !(event.currentTarget as Element).contains(event.relatedTarget as Node)) {
    if (!isInternalDragging.value) {
      isDragOver.value = false
      dragOverIndex.value = -1
    }
  }
}

// 放置处理
const handleDrop = (event: DragEvent, index?: number) => {
  // 标记正在处理 drop 事件
  isDropping.value = true

  // 如果是容器内的拖拽区域，不处理，让容器内的事件处理
  const isContainerArea = isContainerDropArea(event)

  // 检查是否有组件类型数据
  const componentType = event.dataTransfer?.getData('componentType')

  if (isContainerArea) {
    // 立即重置拖拽状态，确保覆盖层和辅助线都隐藏
    isDragOver.value = false
    dragOverIndex.value = -1
    formDesignerStore.setDragState(false)
    // 不阻止事件，让容器内的 drop 事件能够触发
    // 注意：不要调用 event.preventDefault() 和 event.stopPropagation()，让事件继续冒泡到容器
    // 延长延迟时间，确保在 drop 之后的一段时间内不会重新设置状态
    setTimeout(() => {
      isDropping.value = false
      // 再次确保状态被重置
      isDragOver.value = false
      dragOverIndex.value = -1
    }, 1000) // 延长至 1000ms
    return
  }

  // 如果有组件类型数据，立即重置拖拽状态（防止状态残留）
  // 这样可以防止后续的 dragover 事件重新设置 dragOverIndex
  if (componentType) {
    // 立即重置状态，不等待 nextTick
    isDragOver.value = false
    dragOverIndex.value = -1
    formDesignerStore.setDragState(false)
    // 延长延迟时间，确保在 drop 之后的一段时间内不会重新设置状态
    setTimeout(() => {
      isDropping.value = false
      // 再次确保状态被重置
      isDragOver.value = false
      dragOverIndex.value = -1
    }, 1000) // 延长至 1000ms
  } else {
    // 如果没有组件类型，立即重置标志
    setTimeout(() => {
      isDropping.value = false
    }, 500)
  }

  event.preventDefault()
  event.stopPropagation()

  // 检查是否是容器内组件的拖拽（需要移动到画布主区域）
  const internalReorder = event.dataTransfer?.getData('internal-reorder')
  const componentId = event.dataTransfer?.getData('componentId')

  // 如果是从容器内拖出的组件，需要移动到画布主区域
  if (internalReorder === '1' && componentId && draggingIndex.value === null) {
    const parentInfo = formDesignerStore.findComponentParent(componentId)

    // 如果组件在容器内，需要先移除，然后添加到画布主区域
    if (parentInfo && parentInfo.location !== 'main') {
      const component = formDesignerStore.findComponent(componentId)
      if (component) {

        // 从容器中移除
        if (parentInfo.location === 'layout') {
          const layoutContainer = parentInfo.parent as LayoutContainerComponent
          if (layoutContainer.children && typeof parentInfo.childIndex === 'number') {
            layoutContainer.children.splice(parentInfo.childIndex, 1)
          }
        } else if (parentInfo.location === 'tab') {
          const tabsContainer = parentInfo.parent as TabsContainerComponent
          const tab = tabsContainer.tabs.find(t => t.name === parentInfo.tabName)
          if (tab && typeof parentInfo.childIndex === 'number') {
            tab.children.splice(parentInfo.childIndex, 1)
          }
        } else if (parentInfo.location === 'grid') {
          const gridContainer = parentInfo.parent as GridContainerComponent
          if (typeof parentInfo.columnIndex === 'number' && typeof parentInfo.childIndex === 'number') {
            const column = gridContainer.columns[parentInfo.columnIndex]
            if (column && column.children) {
              column.children.splice(parentInfo.childIndex, 1)
            }
          }
        }

        // 添加到画布主区域
        const finalIndex = dragOverIndex.value >= 0 ? dragOverIndex.value : (typeof index === 'number' ? index : components.value.length)
        components.value.splice(finalIndex, 0, component)
        formDesignerStore.saveToHistory()

        toast.success(`已将 ${component.label} 移动到画布`)

        // 重置状态
        isDragOver.value = false
        dragOverIndex.value = -1
        formDesignerStore.setDragState(false)
        return
      }
    }
  }

  // 优先处理画布内排序
  if (draggingIndex.value !== null) {
    const fromIndex = draggingIndex.value
    // 使用辅助线位置作为插入点；若无则按传入索引或末尾
    const toIndex = (dragOverIndex.value >= 0)
      ? dragOverIndex.value
      : (typeof index === 'number' ? index : components.value.length)
    formDesignerStore.moveComponent(fromIndex, toIndex)
    // 重置拖拽状态
    draggingIndex.value = null
    isInternalDragging.value = false
    isDragOver.value = false
    dragOverIndex.value = -1
    formDesignerStore.setDragState(false)
    return
  }

  if (componentType) {
    try {
      const newComponent = formDesignerStore.addComponent(componentType, index)

      // 强制更新组件列表
      forceUpdateKey.value++

      // 显示成功消息
      toast.success(`已添加 ${newComponent.label}`)
    } catch (error: any) {
      console.error('添加组件失败:', error)
      const errorMessage = error?.message || '添加组件失败'
      toast.error(errorMessage)
    }
  } else {
    console.warn('未获取到组件类型')
  }

  // 确保状态完全重置
  isDragOver.value = false
  dragOverIndex.value = -1
  formDesignerStore.setDragState(false)
}

// 在组件之间拖拽悬停
const handleComponentDragOver = (event: DragEvent, index: number) => {
  // 如果正在处理 drop 事件，不设置辅助线索引
  if (isDropping.value) {
    return
  }

  // 如果是容器内的拖拽区域，不处理，让容器内的事件处理
  const isContainerArea = isContainerDropArea(event)
  if (isContainerArea) {
    // 重置辅助线索引，确保辅助线不显示
    dragOverIndex.value = -1
    return
  }

  event.preventDefault()
  dragOverIndex.value = index
}

// 画布内排序：拖拽开始/结束/放下
const handleItemDragStart = (index: number, event: DragEvent) => {
  draggingIndex.value = index
  isInternalDragging.value = true
  event.stopPropagation()
  const component = components.value[index]
  event.dataTransfer?.setData('text/plain', `${index}`)
  event.dataTransfer?.setData('internal-reorder', '1')
  event.dataTransfer?.setData('componentId', component.id) // 添加组件ID，用于判断组件来源
  event.dataTransfer!.effectAllowed = 'move'
}

// 统一的拖拽结束处理函数
const handleItemDragEnd = () => {
  draggingIndex.value = null
  isInternalDragging.value = false
  isDragOver.value = false
  dragOverIndex.value = -1
  formDesignerStore.setDragState(false)
}

const handleItemDrop = (toIndex: number, event: DragEvent) => {
  // 如果是容器内的拖拽区域，不处理，让容器内的事件处理
  if (isContainerDropArea(event)) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  if (draggingIndex.value === null) return
  const fromIndex = draggingIndex.value
  // 如果存在辅助线位置，则以辅助线为准
  const finalToIndex = dragOverIndex.value >= 0 ? dragOverIndex.value : toIndex
  if (fromIndex === finalToIndex) return
  formDesignerStore.moveComponent(fromIndex, finalToIndex)
  draggingIndex.value = null
  isInternalDragging.value = false
  dragOverIndex.value = -1
}

const handleItemDragOver = (event: DragEvent, index?: number) => {
  // 如果正在处理 drop 事件，不设置辅助线索引
  if (isDropping.value) {
    // 确保辅助线索引被重置
    if (dragOverIndex.value !== -1) {
      dragOverIndex.value = -1
    }
    return
  }

  // 检查 dataTransfer 是否真的在进行拖拽操作
  // 注意：在 dragover 事件中，只能通过 types 检查，不能使用 getData
  const allTypes = event.dataTransfer?.types || []
  const hasComponentType = allTypes.includes('componentType') || allTypes.includes('componenttype')
  const hasInternalReorder = allTypes.includes('internal-reorder')
  const hasComponentId = allTypes.includes('componentId') || allTypes.includes('componentid')

  // 如果是内部拖拽（从容器内拖出或画布内排序），即使检测到容器区域，也应该允许显示辅助线
  if (hasInternalReorder || hasComponentId || isInternalDragging.value) {
    // 确保 isDragOver 和 isInternalDragging 已设置
    if (!isDragOver.value) {
      isDragOver.value = true
    }
    if (!isInternalDragging.value && (hasInternalReorder || hasComponentId)) {
      isInternalDragging.value = true
    }

    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer && (event.dataTransfer.dropEffect = 'move')
    // 根据鼠标位置决定插入到该项之前还是之后
    if (typeof index === 'number') {
      const target = event.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const offsetY = event.clientY - rect.top
      const before = offsetY < rect.height / 2
      dragOverIndex.value = before ? index : index + 1
    }
    return
  }

  // 如果没有组件类型、内部排序或组件ID数据，说明拖拽已经结束，不应该设置辅助线
  if (!hasComponentType) {
    // 确保辅助线索引被重置
    if (dragOverIndex.value !== -1) {
      dragOverIndex.value = -1
    }
    return
  }

  // 如果是容器内的拖拽区域，不处理，让容器内的事件处理
  const isContainerArea = isContainerDropArea(event)
  if (isContainerArea) {
    // 对于新组件拖拽（非内部拖拽），清除遮罩和辅助线
    if (!isInternalDragging.value && hasComponentType) {
      isDragOver.value = false
    }
    // 重置辅助线索引，确保辅助线不显示
    dragOverIndex.value = -1
    return
  }

  // 对于新组件拖拽，需要 isDragOver 为 true
  if (!isDragOver.value) {
    // 确保辅助线索引被重置
    if (dragOverIndex.value !== -1) {
      dragOverIndex.value = -1
    }
    return
  }

  event.preventDefault()
  event.stopPropagation()
  event.dataTransfer && (event.dataTransfer.dropEffect = 'copy')
  // 根据鼠标位置决定插入到该项之前还是之后
  if (typeof index === 'number') {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const offsetY = event.clientY - rect.top
    const before = offsetY < rect.height / 2
    dragOverIndex.value = before ? index : index + 1
  }
}

// 选择组件
const selectComponent = (componentId: string, event?: Event) => {
  event?.stopPropagation()
  formDesignerStore.selectComponent(componentId)
}

// 删除组件
const removeComponent = (componentId: string, event: Event) => {
  event.stopPropagation()
  formDesignerStore.removeComponent(componentId)
}

// 复制组件
const duplicateComponent = (componentId: string, event: Event) => {
  event.stopPropagation()
  formDesignerStore.duplicateComponent(componentId)
}

// 清空选择
const clearSelection = () => {
  formDesignerStore.clearSelection()
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (selectedComponentId.value) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      formDesignerStore.removeComponent(selectedComponentId.value)
    } else if (event.key === 'd' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      formDesignerStore.duplicateComponent(selectedComponentId.value)
    }
  }
}

// 调整宽度（span: 1-24）
const increaseSpan = (componentId: string) => {
  const comp = formDesignerStore.currentForm.components.find(c => c.id === componentId)
  if (!comp) return
  const current = comp.span ?? 24
  if (current < 24) {
    formDesignerStore.updateComponent(componentId, { span: Math.min(24, current + 1) } as any)
  }
}

const decreaseSpan = (componentId: string) => {
  const comp = formDesignerStore.currentForm.components.find(c => c.id === componentId)
  if (!comp) return
  const current = comp.span ?? 24
  if (current > 1) {
    formDesignerStore.updateComponent(componentId, { span: Math.max(1, current - 1) } as any)
  }
}
</script>

<template>
  <div class="design-canvas" :class="{ 'drag-over': isDragOver }" @dragenter="handleDragEnter"
    @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop" @click="clearSelection"
    @keydown="handleKeydown" tabindex="0">
    <!-- 空状态 -->
    <div v-if="components.length === 0" class="empty-canvas">
      <div class="empty-state">
        <!-- <Icon icon="lucide:grid-3x3" class="w-24 h-24 text-gray-300" /> -->
        <p class="text-gray-500 mt-4 text-lg">拖拽左侧组件到此处开始设计表单</p>
      </div>
    </div>

    <!-- 表单组件列表 -->
    <div v-else class="components-list" :key="forceUpdateKey" ref="componentsListEl">
      <div class="grid-guides" v-if="isResizing" />
      <form class="form-container" :class="`label-position-${labelPosition}`" :style="{ '--label-width': labelWidth }">
        <!-- 组件间的拖拽指示器 -->
        <div v-if="dragOverIndex === 0" class="drop-indicator" @dragover="handleComponentDragOver($event, 0)"
          @drop="handleDrop($event, 0)" />

        <div class="flex flex-wrap">
          <template v-for="(component, index) in components" :key="`${component.id}-${forceUpdateKey}`">
            <!-- 布局容器：占据整行，不使用栅格 -->
            <div v-if="['layout-container', 'tabs-container', 'grid-container'].includes(component.type)"
              class="component-wrapper container-wrapper" :data-idx="index" :class="{
                'selected': component.id === selectedComponentId,
                'drag-over': dragOverIndex === index + 1
              }" :style="{ width: '100%' }" @dragover="handleItemDragOver($event, index)"
              @drop="handleItemDrop(index, $event)">
              <!-- 组件容器 -->
              <div class="component-container" @click="selectComponent(component.id, $event)" draggable="true"
                @dragstart.stop="handleItemDragStart(index, $event)" @dragend.stop="handleItemDragEnd">
                <!-- 右下角悬浮操作栏（选中时显示） -->
                <div v-if="component.id === selectedComponentId" class="action-bar">

                  <Button class="fab-btn w-8 h-8" size="icon" variant="default"
                    @click="duplicateComponent(component.id, $event)">
                    <Icon icon="fuzhi-F" :size="16" />
                  </Button>

                  <Button class="fab-btn w-8 h-8" size="icon" variant="destructive"
                    @click="removeComponent(component.id, $event)">
                    <Icon icon="shanchu" :size="16" />
                  </Button>
                </div>

                <!-- 容器组件 -->
                <ContainerRenderer :component="component" />
              </div>

              <!-- 组件间的拖拽指示器 -->
              <div v-if="dragOverIndex === index + 1" class="drop-indicator"
                @dragover="handleComponentDragOver($event, index + 1)" @drop="handleDrop($event, index + 1)" />
            </div>

            <!-- 普通表单组件：使用栅格系统 -->
            <div v-else class="component-wrapper" :class="{
              'selected': component.id === selectedComponentId,
              'drag-over': dragOverIndex === index + 1
            }" :style="{ width: `calc(${(component.span || 24) / 24 * 100}% - ${(component.span || 24) / 24 * 1}px)` }"
              :data-idx="index" @dragover="handleItemDragOver($event, index)" @drop="handleItemDrop(index, $event)">
              <!-- 组件容器 -->
              <div class="component-container" @click="selectComponent(component.id, $event)" draggable="true"
                @dragstart.stop="handleItemDragStart(index, $event)" @dragend.stop="handleItemDragEnd">
                <!-- 右下角悬浮操作栏（选中时显示） -->
                <div v-if="component.id === selectedComponentId" class="action-bar">
                  <Button class="fab-btn  w-8 h-8" size="icon" variant="default"
                    @click="duplicateComponent(component.id, $event)">
                    <Icon icon="fuzhi-F" />
                  </Button>
                  <Button class="fab-btn w-8 h-8" size="icon" variant="destructive"
                    @click="removeComponent(component.id, $event)">
                    <Icon icon="shanchu" />
                  </Button>
                </div>

                <!-- 调整大小手柄（右侧居中） -->
                <div class="resize-handle" @mousedown="handleResizeStart(index, $event)" />
                <div v-if="isResizing && resizeBadgeSpan !== null && index === resizingIndex" class="resize-badge">
                  {{ resizeBadgeSpan }}/24
                </div>

                <!-- 普通表单组件 -->
                <div class="form-item-preview">
                  <Label :class="{ 'required': component.required }" class="form-label">
                    {{ component.label }}
                  </Label>
                  <FormComponentRenderer :component="component" :disabled="false" />
                </div>
              </div>

              <!-- 组件间的拖拽指示器 -->
              <div v-if="dragOverIndex === index + 1" class="drop-indicator"
                @dragover="handleComponentDragOver($event, index + 1)" @drop="handleDrop($event, index + 1)" />
            </div>
          </template>
        </div>
      </form>
    </div>

    <!-- 拖拽遮罩：只在非内部拖拽时显示 -->
    <div v-if="showDragOverlay" class="drag-overlay">
      <div class="drag-hint">
        <Icon icon="lucide:plus" class="w-12 h-12" />
        <span>松开鼠标添加组件</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.design-canvas {
  height: 100%;
  /* background: var(--bg-card); */
  border-radius: 8px;
  position: relative;
  outline: none;
  transition: all 0.2s ease;
  overflow-y: auto;
}

.design-canvas:focus {
  box-shadow: 0 0 0 2px var(--primary-light);
}

.empty-canvas {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-canvas .el-empty {
  padding: 60px 40px;
}

.empty-canvas .el-empty :deep(.el-empty__description) {
  color: var(--text-secondary);
  font-size: 14px;
}

.components-list {
  padding: 16px;
  /* 使用 el-row/el-col 布局，不再需要 Grid */
}

/* 网格引导线 */
.grid-guides {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(to right,
      rgba(64, 158, 255, 0.08) 0,
      rgba(64, 158, 255, 0.08) 1px,
      transparent 1px,
      transparent calc((100% - 23 * 8px) / 24));
  background-size: calc((100% - 23 * 8px) / 24 + 8px) 100%;
}

.component-wrapper {
  position: relative;
  margin-bottom: 0;
  group: component;
}

.component-container {
  /* background: var(--background); */
  /* border: 2px solid transparent; */
  border-radius: 8px;
  padding: 10px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

/* .component-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  border-radius: 6px;
  transition: background 0.15s ease;
  pointer-events: none;
} */

/* .component-container:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
} */

/* .component-container:hover::before {
  background: transparent;
} */

/* .component-wrapper.selected .component-container {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.component-wrapper.selected .component-container::before {
  background: transparent;
} */

/* 深色模式下选中组件的特殊处理 */
/* [data-theme='dark'] .component-wrapper.selected .component-container {
  background: rgba(99, 102, 241, 0.15);
}

[data-theme='dark'] .component-wrapper.selected .component-container::before {
  background: transparent;
} */

/* 右下角悬浮操作栏（选中时显示） */
.action-bar {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  gap: 6px;
  z-index: 20;
}

.fab-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.form-item-preview {
  width: 100%;

  .form-label {
    margin-bottom: 12px;
  }
}


.drop-indicator {
  height: 3px;
  background: var(--primary-color);
  border-radius: 2px;
  margin: 6px 0;
  opacity: 1 !important;
  transition: opacity 0.12s ease;
  position: relative;
  z-index: 10;
  width: 100%;
  display: block;
}

.drop-indicator::before {
  content: '';
  position: absolute;
  left: -6px;
  top: -3px;
  width: 9px;
  height: 9px;
  background: var(--primary-color);
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--bg-card);
  z-index: 11;
}

.drop-indicator:hover {
  opacity: 1 !important;
}

/* 拖拽经过时，目标项轻微高亮 */
.component-wrapper.drag-over .component-container {
  box-shadow: 0 0 0 2px var(--primary-light);
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-light);
  backdrop-filter: blur(1px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 8px;
  /* 允许事件穿透，让容器内的拖拽区域能够接收事件 */
  pointer-events: none;
}

.drag-overlay .drag-hint {
  pointer-events: auto;
}

.drag-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  border: 2px dashed var(--primary-color);
}

.drag-hint .el-icon {
  color: var(--primary-color);
  margin-bottom: 12px;
}

.drag-hint span {
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 500;
}

/* 动画效果 */
@keyframes componentEnter {
  from {
    opacity: 0.4;
    transform: translateY(6px) scale(0.99);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.component-wrapper {
  animation: componentEnter 0.16s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .components-list {
    padding: 12px;
  }

  .component-container {
    padding: 10px;
  }
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -6px;
  width: 12px;
  height: 100%;
  cursor: ew-resize;
  z-index: 15;
  opacity: 0;
  transition: opacity 0.12s ease;
}

.component-container:hover .resize-handle {
  opacity: 1;
}

/* 提示更易抓取 */
.resize-handle::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 4px;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--primary-color);
  border-radius: 2px;
  opacity: 0.6;
}

.resize-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: var(--primary-color);
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  padding: 0 6px;
  border-radius: 9px;
  z-index: 16;
  opacity: 0.9;
}
</style>