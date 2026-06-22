<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { toast } from 'vue-sonner'

import type { FormComponent, LayoutContainerComponent, TabsContainerComponent, GridContainerComponent } from '@/components/chronos-ui/form-designer/utils/types-form'
import FormComponentRenderer from './FormComponentRenderer.vue'
import ContainerHeader from './ContainerHeader.vue'
import { getLayoutContainerStyle, getGridContainerStyle, getGridColumnStyle } from './utils/containerStyles'
import { useFormDesignerStore } from '@/store/modules/formDesigner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Icon } from '../Icon'

interface Props {
  component: FormComponent
  parentId?: string
  depth?: number
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0
})

const formDesignerStore = useFormDesignerStore()
const selectedComponentId = computed(() => formDesignerStore.selectedComponentId)

// 从 store 获取最新的组件数据，确保响应式更新
// 通过访问 children 数组和组件属性来确保响应式追踪
const component = computed(() => {
  const found = formDesignerStore.findComponent(props.component.id)
  if (found) {
    // 访问组件属性以确保响应式追踪（特别是 label、placeholder 等）
    const _label = found.label
    const _name = found.name
    const _type = found.type
    const _required = found.required
    const _disabled = found.disabled
    const _placeholder = (found as any).placeholder

    // 访问嵌套数组以确保响应式追踪
    if (found.type === 'layout-container') {
      const layoutContainer = found as LayoutContainerComponent
      // 访问 children 数组和 length 来触发响应式更新
      const children = layoutContainer.children
      if (children) {
        // 访问数组长度和内容来确保响应式追踪
        const _ = children.length
        const __ = children.map(c => c.id).join(',')
      }
    } else if (found.type === 'tabs-container') {
      const tabsContainer = found as TabsContainerComponent
      tabsContainer.tabs.forEach(tab => {
        const _ = tab.children?.length
      })
    } else if (found.type === 'grid-container') {
      const gridContainer = found as GridContainerComponent
      gridContainer.columns.forEach(column => {
        const _ = column.children?.length
      })
    }
  }
  return found || props.component
})

// 容器内拖拽排序状态
const draggingChildIndex = ref<number | null>(null)
const dragOverChildIndex = ref<number>(-1)

// 强制更新key，用于强制重新渲染
const forceUpdateKey = ref(0)

// 监听组件children数组的变化，强制更新
// 使用 deep watch 来监听数组内容的变化
watch(() => {
  const comp = component.value
  if (comp && comp.type === 'layout-container') {
    const layoutContainer = comp as LayoutContainerComponent
    // 返回数组引用和内容，确保能检测到排序变化
    return layoutContainer.children ? [...layoutContainer.children] : []
  } else if (comp && comp.type === 'tabs-container') {
    const tabsContainer = comp as TabsContainerComponent
    return tabsContainer.tabs.map(tab => tab.children ? [...tab.children] : [])
  } else if (comp && comp.type === 'grid-container') {
    const gridContainer = comp as GridContainerComponent
    return gridContainer.columns.map(col => col.children ? [...col.children] : [])
  }
  return []
}, () => {
  nextTick(() => {
    forceUpdateKey.value++
  })
}, { deep: true, immediate: false })

// 选择组件
const selectComponent = (componentId: string, event?: Event) => {
  event?.stopPropagation()
  formDesignerStore.selectComponent(componentId)
}

// 删除组件
const removeComponent = (componentId: string, event: Event) => {
  event.stopPropagation()
  if (props.parentId) {
    formDesignerStore.removeChildFromContainer(props.parentId, componentId)
  } else {
    formDesignerStore.removeComponent(componentId)
  }
}

// 处理容器内拖拽
const handleContainerDrop = (event: DragEvent, containerId: string, index?: number, columnIndex?: number) => {
  event.preventDefault()
  event.stopPropagation()

  // 检查是否是已存在组件的拖拽（内部排序或跨容器移动）
  // 注意：getData 方法对类型名称大小写敏感，但某些浏览器可能会标准化为小写
  const internalReorder = event.dataTransfer?.getData('internal-reorder')
  const componentId = event.dataTransfer?.getData('componentId') || event.dataTransfer?.getData('componentid')
  const draggedIndex = event.dataTransfer?.getData('text/plain')
  // 尝试多种可能的类型名称（因为浏览器可能标准化为小写）
  const componentType = event.dataTransfer?.getData('componentType') || event.dataTransfer?.getData('componenttype')

  if (internalReorder === '1' && componentId) {
    // 检查组件是否在当前容器内
    const parentInfo = formDesignerStore.findComponentParent(componentId)
    const targetContainer = formDesignerStore.findComponent(containerId)

    // 判断是否是容器内排序：组件在当前容器内
    const isInContainer = parentInfo &&
      parentInfo.parent &&
      parentInfo.parent.id === containerId

    if (isInContainer && parentInfo && typeof parentInfo.childIndex === 'number') {
      // 容器内排序
      const fromIndex = parentInfo.childIndex
      const toIndex = dragOverChildIndex.value >= 0 ? dragOverChildIndex.value : (typeof index === 'number' ? index : -1)

      if (fromIndex !== toIndex && toIndex >= 0) {
        // 如果是栅格容器，需要处理指定列的排序
        if (typeof columnIndex === 'number' && parentInfo.location === 'grid' && typeof parentInfo.columnIndex === 'number') {
          const container = formDesignerStore.findComponent(containerId) as GridContainerComponent
          if (container && container.type === 'grid-container') {
            // 如果是同一列内排序
            if (parentInfo.columnIndex === columnIndex) {
              const column = container.columns[columnIndex]
              if (column && column.children) {
                const moveInArray = (children: FormComponent[]) => {
                  if (fromIndex < 0 || fromIndex >= children.length) return
                  const item = children.splice(fromIndex, 1)[0]
                  let insertIndex = toIndex
                  if (fromIndex < toIndex) insertIndex = toIndex - 1
                  insertIndex = Math.max(0, Math.min(insertIndex, children.length))
                  children.splice(insertIndex, 0, item)
                }
                moveInArray(column.children)
                formDesignerStore.saveToHistory()
                // 手动触发强制更新
                nextTick(() => {
                  forceUpdateKey.value++
                })
              }
            } else {
              // 跨列移动：从一列移动到另一列
              const sourceColumn = container.columns[parentInfo.columnIndex]
              const targetColumn = container.columns[columnIndex]
              if (sourceColumn && targetColumn && sourceColumn.children && targetColumn.children) {
                const item = sourceColumn.children.splice(fromIndex, 1)[0]
                const insertIndex = Math.max(0, Math.min(toIndex, targetColumn.children.length))
                targetColumn.children.splice(insertIndex, 0, item)
                formDesignerStore.saveToHistory()
                // 手动触发强制更新
                nextTick(() => {
                  forceUpdateKey.value++
                })
              }
            }
          }
        } else if (parentInfo.location === 'layout' || parentInfo.location === 'tab') {
          // 布局容器或页签容器内排序
          formDesignerStore.moveChildInContainer(containerId, fromIndex, toIndex)

          // 手动触发强制更新，确保UI刷新
          nextTick(() => {
            forceUpdateKey.value++
          })
        }
      }
    } else if (targetContainer) {
      // 跨容器移动：组件不在当前容器内，需要移动到容器中
      try {
        const finalIndex = dragOverChildIndex.value >= 0 ? dragOverChildIndex.value : index
        formDesignerStore.moveComponentToContainer(componentId, containerId, finalIndex, columnIndex)
        const component = formDesignerStore.findComponent(componentId)
        if (component) {
          toast.success(`已将 ${component.label} 移动到容器`)
        }
      } catch (error: any) {
        console.error('移动组件到容器失败:', error)
        toast.error(error?.message || '移动组件失败')
      }
    }

    // 重置状态
    draggingChildIndex.value = null
    dragOverChildIndex.value = -1
    return
  }

  // 处理从组件面板拖拽新组件的情况
  // componentType 已在上面声明
  if (!componentType) {
    return
  }

  // 检查容器是否存在
  const container = formDesignerStore.findComponent(containerId)
  if (!container) {
    console.warn('容器不存在，无法添加子组件')
    return
  }

  try {
    if (typeof columnIndex === 'number') {
      // 栅格容器的列
      const newComponent = formDesignerStore.addChildToGridColumn(containerId, columnIndex, componentType, index)
      toast.success(`已添加 ${newComponent.label} 到容器`)
    } else {
      const newComponent = formDesignerStore.addChildToContainer(containerId, componentType, index)
      toast.success(`已添加 ${newComponent.label} 到容器`)
    }
  } catch (error: any) {
    console.error('添加子组件失败:', error)
    toast.error(error?.message || '添加组件失败')
  }
}

// 处理页签容器内拖拽
const handleTabDrop = (event: DragEvent, containerId: string, tabName: string, index?: number) => {
  event.preventDefault()
  event.stopPropagation()

  // 检查是否是已存在组件的拖拽（内部排序或跨容器移动）
  const internalReorder = event.dataTransfer?.getData('internal-reorder')
  const componentId = event.dataTransfer?.getData('componentId')
  const draggedIndex = event.dataTransfer?.getData('text/plain')

  if (internalReorder === '1' && componentId) {
    // 检查组件是否在当前标签页内
    const parentInfo = formDesignerStore.findComponentParent(componentId)
    const targetContainer = formDesignerStore.findComponent(containerId) as TabsContainerComponent

    // 判断是否是标签页内排序：组件在当前容器的当前标签页内
    const isInTab = parentInfo &&
      parentInfo.parent &&
      parentInfo.parent.id === containerId &&
      parentInfo.location === 'tab' &&
      parentInfo.tabName === tabName

    if (isInTab && parentInfo && typeof parentInfo.childIndex === 'number') {
      // 标签页内排序
      const fromIndex = parentInfo.childIndex
      const toIndex = dragOverChildIndex.value >= 0 ? dragOverChildIndex.value : (typeof index === 'number' ? index : -1)

      if (fromIndex !== toIndex && toIndex >= 0) {
        formDesignerStore.moveChildInContainer(containerId, fromIndex, toIndex)
        // 手动触发强制更新
        nextTick(() => {
          forceUpdateKey.value++
        })
      }
    } else if (targetContainer) {
      // 跨容器移动：组件不在当前标签页内，需要移动到标签页中
      try {
        // 对于页签容器，需要先移动到容器，然后确保在正确的标签页
        // 由于 moveComponentToContainer 不支持直接指定标签页，我们需要特殊处理
        const finalIndex = dragOverChildIndex.value >= 0 ? dragOverChildIndex.value : index

        // 先移动到容器（会添加到当前激活的标签页）
        formDesignerStore.moveComponentToContainer(componentId, containerId, finalIndex)

        // 如果目标标签页不是当前激活的标签页，需要移动到正确的标签页
        if (targetContainer.activeTab !== tabName) {
          const component = formDesignerStore.findComponent(componentId)
          if (component) {
            // 从当前标签页移除
            const activeTab = targetContainer.tabs.find(tab => tab.name === targetContainer.activeTab)
            if (activeTab && activeTab.children) {
              const compIndex = activeTab.children.findIndex(c => c.id === componentId)
              if (compIndex > -1) {
                activeTab.children.splice(compIndex, 1)
              }
            }
            // 添加到目标标签页
            const targetTab = targetContainer.tabs.find(tab => tab.name === tabName)
            if (targetTab) {
              if (!targetTab.children) {
                targetTab.children = []
              }
              if (typeof finalIndex === 'number' && finalIndex >= 0 && finalIndex <= targetTab.children.length) {
                targetTab.children.splice(finalIndex, 0, component)
              } else {
                targetTab.children.push(component)
              }
              formDesignerStore.saveToHistory()
            }
          }
        }

        const component = formDesignerStore.findComponent(componentId)
        if (component) {
          toast.success(`已将 ${component.label} 移动到标签页`)
        }
      } catch (error: any) {
        console.error('移动组件到标签页失败:', error)
        toast.error(error?.message || '移动组件失败')
      }
    }

    // 重置状态
    draggingChildIndex.value = null
    dragOverChildIndex.value = -1
    return
  }

  // 处理从组件面板拖拽新组件的情况
  const componentType = event.dataTransfer?.getData('componentType')
  if (!componentType) {
    return
  }

  // 检查容器是否存在
  const container = formDesignerStore.findComponent(containerId)
  if (!container) {
    console.warn('容器不存在，无法添加子组件')
    return
  }

  try {
    const newComponent = formDesignerStore.addChildToTab(containerId, tabName, componentType, index)
    toast.success(`已添加 ${newComponent.label} 到标签页`)
  } catch (error: any) {
    console.error('添加子组件失败:', error)
    toast.error(error?.message || '添加组件失败')
  }
}

// 处理容器内拖拽悬停
const handleContainerDragOver = (event: DragEvent, containerId?: string) => {
  // 检查是否有组件类型数据（从组件面板拖拽的）或内部排序数据
  // 注意：在 dragover 事件中无法读取 dataTransfer 数据，只能检查 types
  // 注意：dataTransfer.types 中的类型名称可能是小写的（浏览器标准化），需要检查多种可能
  const allTypes = event.dataTransfer?.types || []
  const hasComponentType = allTypes.includes('componentType') || allTypes.includes('componenttype') || allTypes.some(t => t.toLowerCase() === 'componenttype')
  const hasComponentId = allTypes.includes('componentId') || allTypes.includes('componentid') || allTypes.some(t => t.toLowerCase() === 'componentid')
  const hasInternalReorder = allTypes.includes('internal-reorder')

  if (!hasComponentType && !hasInternalReorder && !hasComponentId) {
    // 如果没有组件类型、组件ID或内部排序数据，不处理
    return
  }

  // 如果有容器ID，检查容器是否存在
  if (containerId) {
    const container = formDesignerStore.findComponent(containerId)
    if (!container) {
      // 容器不存在，不阻止事件，让事件冒泡
      return
    }
  }

  // 允许放置
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer) {
    if (hasInternalReorder) {
      event.dataTransfer.dropEffect = 'move'
    } else {
      event.dataTransfer.dropEffect = 'copy'
    }
  }
}

// 容器内子组件拖拽开始
const handleChildDragStart = (index: number, event: DragEvent, componentId?: string) => {
  draggingChildIndex.value = index

  // 获取子组件的ID
  let childId = componentId
  if (!childId) {
    if (component.value.type === 'layout-container') {
      const layoutContainer = component.value as LayoutContainerComponent
      childId = layoutContainer.children?.[index]?.id
    } else if (component.value.type === 'tabs-container') {
      const tabsContainer = component.value as TabsContainerComponent
      const activeTab = tabsContainer.tabs.find(tab => tab.name === tabsContainer.activeTab) || tabsContainer.tabs[0]
      childId = activeTab?.children?.[index]?.id
    } else if (component.value.type === 'grid-container') {
      // 对于栅格容器，需要从所有列中查找
      const gridContainer = component.value as GridContainerComponent
      // 遍历所有列查找对应索引的组件（这里简化处理，实际应该根据列索引）
      for (const column of gridContainer.columns) {
        if (column.children && column.children[index]) {
          childId = column.children[index].id
          break
        }
      }
    }
  }

  event.stopPropagation()
  event.dataTransfer?.setData('text/plain', `${index}`)
  event.dataTransfer?.setData('internal-reorder', '1')
  if (childId) {
    event.dataTransfer?.setData('componentId', childId)
  }
  event.dataTransfer!.effectAllowed = 'move'
}

// 容器内子组件拖拽悬停
const handleChildDragOver = (event: DragEvent, index: number) => {
  // 检查是否是内部拖拽（通过 dataTransfer types 判断，因为 dragover 时无法读取数据）
  const hasInternalReorder = event.dataTransfer?.types.includes('internal-reorder')
  const hasComponentId = event.dataTransfer?.types.includes('componentId')

  // 如果不是内部拖拽，不处理
  if (!hasInternalReorder && !hasComponentId) return

  event.preventDefault()
  event.stopPropagation()
  event.dataTransfer && (event.dataTransfer.dropEffect = 'move')

  // 根据鼠标位置决定插入到该项之前还是之后
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const offsetY = event.clientY - rect.top
  const before = offsetY < rect.height / 2
  dragOverChildIndex.value = before ? index : index + 1
}

</script>

<template>
  <div class="container-renderer"
    :class="{ 'is-container': ['layout-container', 'tabs-container', 'grid-container'].includes(component.type) }">
    <!-- 布局容器 -->
    <template v-if="component.type === 'layout-container'">
      <div class="layout-container-wrapper" :class="{ selected: component.id === selectedComponentId }"
        @click.stop="selectComponent(component.id, $event)">
        <ContainerHeader :component-id="component.id" :label="component.label" @select="selectComponent"
          @delete="removeComponent" />
        <div class="container-content" :style="getLayoutContainerStyle(component as LayoutContainerComponent)"
          @drop="handleContainerDrop($event, component.id)" @dragover="handleContainerDragOver($event, component.id)">
          <div v-for="(child, index) in (component as LayoutContainerComponent).children"
            :key="`${child.id}-${forceUpdateKey}`" class="container-child-wrapper"
            :class="{ 'drag-over': dragOverChildIndex === index }" draggable="true"
            @dragstart="handleChildDragStart(index, $event, child.id)" @dragover="handleChildDragOver($event, index)"
            @drop="handleContainerDrop($event, component.id, index)">
            <ContainerRenderer :component="child" :parent-id="component.id" :depth="depth + 1" />
            <div v-if="dragOverChildIndex === index" class="drop-indicator"></div>
          </div>
          <div v-if="(component as LayoutContainerComponent).children.length === 0" class="empty-container">
            <span>拖拽组件到此处</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 页签容器 -->
    <template v-else-if="component.type === 'tabs-container'">
      <div class="tabs-container-wrapper" :class="{ selected: component.id === selectedComponentId }" :style="{
        padding: (component as TabsContainerComponent).padding || '0px',
        margin: (component as TabsContainerComponent).margin || '0px'
      }" @click.stop="selectComponent(component.id, $event)">
        <ContainerHeader :component-id="component.id" :label="component.label" @select="selectComponent"
          @delete="removeComponent" />
        <Tabs
          :value="(component as TabsContainerComponent).activeTab || (component as TabsContainerComponent).tabs[0]?.name"
          class="tabs-container w-full">
          <TabsList>
            <TabsTrigger v-for="tab in (component as TabsContainerComponent).tabs" :key="tab.name" :value="tab.name">
              {{ tab.label }}
            </TabsTrigger>
          </TabsList>
          <TabsContent v-for="tab in (component as TabsContainerComponent).tabs" :key="tab.name" :value="tab.name">
            <div class="tab-content" @drop="handleTabDrop($event, component.id, tab.name)"
              @dragover="handleContainerDragOver($event, component.id)">
              <div v-for="(child, index) in tab.children" :key="`${child.id}-${forceUpdateKey}`"
                class="container-child-wrapper" :class="{ 'drag-over': dragOverChildIndex === index }" draggable="true"
                @dragstart="handleChildDragStart(index, $event, child.id)"
                @dragover="handleChildDragOver($event, index)"
                @drop="handleTabDrop($event, component.id, tab.name, index)">
                <ContainerRenderer :component="child" :parent-id="component.id" :depth="depth + 1" />
                <div v-if="dragOverChildIndex === index" class="drop-indicator"></div>
              </div>
              <div v-if="tab.children.length === 0" class="empty-container">
                <span>拖拽组件到此处</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </template>

    <!-- 栅格容器 -->
    <template v-else-if="component.type === 'grid-container'">
      <div class="grid-container-wrapper" :class="{ selected: component.id === selectedComponentId }" :style="{
        padding: (component as GridContainerComponent).padding || '0px',
        margin: (component as GridContainerComponent).margin || '0px'
      }" @click.stop="selectComponent(component.id, $event)">
        <ContainerHeader :component-id="component.id" :label="component.label" @select="selectComponent"
          @delete="removeComponent" />
        <div :style="getGridContainerStyle(component as GridContainerComponent)" class="grid-container">
          <div v-for="(column, colIndex) in (component as GridContainerComponent).columns" :key="colIndex"
            :style="getGridColumnStyle(column.span, (component as GridContainerComponent).columns.length, typeof (component as GridContainerComponent).gutter === 'number' ? (component as GridContainerComponent).gutter : (typeof (component as GridContainerComponent).gutter === 'string' ? parseFloat((component as GridContainerComponent).gutter) || 20 : 20))"
            class="grid-col-item">
            <div class="grid-column" @drop="handleContainerDrop($event, component.id, undefined, colIndex)"
              @dragover="handleContainerDragOver($event, component.id)">
              <div v-for="(child, index) in column.children" :key="`${child.id}-${forceUpdateKey}`"
                class="container-child-wrapper" :class="{ 'drag-over': dragOverChildIndex === index }" draggable="true"
                @dragstart="handleChildDragStart(index, $event, child.id)"
                @dragover="handleChildDragOver($event, index)"
                @drop="handleContainerDrop($event, component.id, index, colIndex)">
                <ContainerRenderer :component="child" :parent-id="component.id" :depth="depth + 1" />
                <div v-if="dragOverChildIndex === index" class="drop-indicator"></div>
              </div>
              <div v-if="column.children.length === 0" class="empty-container">
                <span>拖拽组件到此处</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 普通组件 -->
    <template v-else>
      <div class="component-item" :class="{ selected: component.id === selectedComponentId }"
        @click.stop="selectComponent(component.id, $event)">
        <div class="form-item-preview" :class="{ 'is-required': component.required }">
          <label v-if="component.label" class="form-item-label">{{ component.label }}</label>
          <div class="form-item-content">
            <FormComponentRenderer :component="component" :disabled="false" />
          </div>
        </div>
        <Button v-if="component.id === selectedComponentId" size="sm" variant="destructive" class="delete-btn w-8 h-8"
          @click.stop="removeComponent(component.id, $event)">
          <Icon icon="fuzhi-F" />
        </Button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.container-renderer {
  width: 100%;
  /* background: var(--background); */
}


.container-content {
  transition: all 0.2s ease;
}

.container-content:hover {
  /* border-color: var(--primary-color, #6366f1) !important; */
  /* background: var(--primary-light, rgba(99, 102, 241, 0.05)) !important; */
}

.tab-content,
.grid-column {
  min-height: 60px;
  /* padding: 12px; */
  /* border: 1px dashed var(--border-color, #e5e7eb); */
  border-radius: 4px;
  /* background: var(--bg-secondary, #f9fafb); */
  transition: all 0.2s ease;
}

.tab-content:hover,
.grid-column:hover {
  /* border-color: var(--primary-color, #6366f1); */
  /* background: var(--primary-light, rgba(99, 102, 241, 0.05)); */
}

/* 栅格容器样式 */
.grid-container {
  width: 100%;
  box-sizing: border-box;
}

.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  color: var(--text-muted, #9ca3af);
  font-size: 12px;
}

.layout-container-wrapper,
.tabs-container-wrapper,
.grid-container-wrapper {
  border: 2px solid transparent;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.layout-container-wrapper.selected,
.tabs-container-wrapper.selected,
.grid-container-wrapper.selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-light, rgba(99, 102, 241, 0.2));
}

.component-item {
  position: relative;
  margin-bottom: 12px;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.component-item.selected {
  border-color: var(--primary-color, #6366f1);
  box-shadow: 0 0 0 2px var(--primary-light, rgba(99, 102, 241, 0.2));
}

.component-item .delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.form-item-preview {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-item-label {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 13px;
}

.form-item-label::after {
  content: '';
}

.form-item-preview.is-required .form-item-label::after {
  content: '*';
  color: var(--color-red-500);
  margin-left: 2px;
}

.form-item-content {
  pointer-events: none;
  opacity: 0.8;
  width: 100%;
}

.container-child-wrapper {
  position: relative;
  margin-bottom: 8px;
}

.container-child-wrapper.drag-over {
  position: relative;
}

.drop-indicator {
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 2px;
  /* background: var(--primary-color, #6366f1); */
  z-index: 10;
  pointer-events: none;
}
</style>
