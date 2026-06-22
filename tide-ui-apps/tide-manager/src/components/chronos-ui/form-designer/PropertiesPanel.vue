<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Icon } from '@/components/chronos-ui/Icon'
import { useFormDesignerStore } from '@/store/modules/formDesigner'
import type {
  FormComponent, SelectComponent, RadioComponent,
  LayoutContainerComponent, TabsContainerComponent,
  GridContainerComponent
} from '@/components/chronos-ui/form-designer/utils/types-form'
import { getPaddingPreset, getMarginPreset, getBorderRadiusPreset, getMinHeightPreset } from './utils/presetValues'
import { useDragAndDrop } from './composables/useDragAndDrop'
import DisplayRulesConfig from './DisplayRulesConfig.vue'
import { getComponentDefault } from './utils/components'

const formDesignerStore = useFormDesignerStore()

// 当前Tab：form（表单设置）| component（组件属性）
const activeTab = ref<'form' | 'component'>('form')

// 折叠面板活动项（已不再使用，仅保留变量以避免潜在引用报错）
const activeNames = ref(['basic'])

// 计算属性
const selectedComponent = computed(() => {
  console.log('PropertiesPanel - selectedComponent computed called, value:', formDesignerStore.selectedComponent);
  return formDesignerStore.selectedComponent;
})
const hasSelection = computed(() => {
  const has = !!selectedComponent.value;
  console.log('PropertiesPanel - hasSelection computed called, value:', has);
  return has;
})
// 判断是否是容器组件
const isContainerComponent = computed(() => {
  if (!selectedComponent.value) return false
  return ['layout-container', 'tabs-container', 'grid-container'].includes(selectedComponent.value.type)
})

// 监听组件选择，自动切换到组件属性标签页
watch(selectedComponent, (newVal) => {
  if (newVal) {
    activeTab.value = 'component'
  }
})

// 边距设置选择状态跟踪（用于跟踪下拉框选择，解决自定义模式无法输入的问题）
const paddingSelectState = ref<Record<string, string>>({})
const marginSelectState = ref<Record<string, string>>({})

// 获取内边距选择状态
const getPaddingSelectState = (componentId: string, currentValue: string) => {
  return paddingSelectState.value[componentId] ?? getPaddingPreset(currentValue)
}

// 获取外边距选择状态
const getMarginSelectState = (componentId: string, currentValue: string) => {
  return marginSelectState.value[componentId] ?? getMarginPreset(currentValue)
}

// 处理内边距下拉框变化
const handlePaddingChange = (val: string, componentId: string, currentValue: string) => {
  if (val !== 'custom') {
    updateProperty('padding', val)
    paddingSelectState.value[componentId] = val
  } else {
    // 选择自定义时，只更新状态变量，不更新属性值（保持当前值）
    paddingSelectState.value[componentId] = 'custom'
  }
}

// 处理外边距下拉框变化
const handleMarginChange = (val: string, componentId: string, currentValue: string) => {
  if (val !== 'custom') {
    updateProperty('margin', val)
    marginSelectState.value[componentId] = val
  } else {
    // 选择自定义时，只更新状态变量，不更新属性值（保持当前值）
    marginSelectState.value[componentId] = 'custom'
  }
}

// 检查是否应该显示自定义输入框（内边距）
const shouldShowPaddingInput = (componentId: string, currentValue: string) => {
  return getPaddingSelectState(componentId, currentValue) === 'custom'
}

// 检查是否应该显示自定义输入框（外边距）
const shouldShowMarginInput = (componentId: string, currentValue: string) => {
  return getMarginSelectState(componentId, currentValue) === 'custom'
}

// 更新组件属性
const updateProperty = (property: string, value: any) => {
  if (selectedComponent.value) {
    formDesignerStore.updateComponent(selectedComponent.value.id, {
      [property]: value
    })
  }
}

// 添加选项（用于select、radio、checkbox组件）
const addOption = () => {
  if (!selectedComponent.value) return

  const component = selectedComponent.value as SelectComponent
  if (!component.options) component.options = []

  const newOption = {
    label: `选项${component.options.length + 1}`,
    value: `option${component.options.length + 1}`,
    disabled: false
  }

  component.options.push(newOption)
  updateProperty('options', component.options)
}

// 删除选项
const removeOption = (index: number) => {
  if (!selectedComponent.value) return

  const component = selectedComponent.value as SelectComponent
  if (component.options && component.options.length > 1) {
    component.options.splice(index, 1)
    updateProperty('options', component.options)
  }
}

// 更新选项
const updateOption = (index: number, field: string, value: any) => {
  if (!selectedComponent.value) return

  const component = selectedComponent.value as SelectComponent
  if (component.options && component.options[index]) {
    ; (component.options[index] as any)[field] = value
    updateProperty('options', component.options)
  }
}

// 添加验证规则
const addValidationRule = () => {
  if (!selectedComponent.value) return

  if (!selectedComponent.value.rules) {
    selectedComponent.value.rules = []
  }

  const newRule = {
    required: false,
    message: '',
    trigger: 'blur' as const
  }

  selectedComponent.value.rules.push(newRule)
  updateProperty('rules', selectedComponent.value.rules)
}

// 删除验证规则
const removeValidationRule = (index: number) => {
  if (!selectedComponent.value || !selectedComponent.value.rules) return

  selectedComponent.value.rules.splice(index, 1)
  updateProperty('rules', selectedComponent.value.rules)
}

// 更新验证规则
const updateValidationRule = (index: number, field: string, value: any) => {
  if (!selectedComponent.value || !selectedComponent.value.rules) return

    ; (selectedComponent.value.rules[index] as any)[field] = value
  updateProperty('rules', selectedComponent.value.rules)
}

// 更新表单显示规则
const updateFormDisplayRules = (rules: any[]) => {
  console.log('更新表单显示规则:', rules)
  formDesignerStore.updateFormConfig({ displayRules: rules })
  console.log('当前表单配置:', formDesignerStore.currentForm)
}

// 容器组件相关方法
// 布局容器
const addChildToLayoutContainer = () => {
  if (!selectedComponent.value || selectedComponent.value.type !== 'layout-container') return
  try {
    formDesignerStore.addChildToContainer(selectedComponent.value.id, 'input')
    toast.success('组件已添加')
  } catch (error) {
    toast.error('添加组件失败')
  }
}

const removeChildFromLayoutContainer = (childId: string) => {
  if (!selectedComponent.value) return
  formDesignerStore.removeChildFromContainer(selectedComponent.value.id, childId)
  toast.success('组件已删除')
}

// 选择子组件
const selectChildComponent = (childId: string) => {
  formDesignerStore.selectComponent(childId)
}

// 在布局容器内移动子组件
const moveChildInLayoutContainer = (fromIndex: number, toIndex: number) => {
  if (!selectedComponent.value || selectedComponent.value.type !== 'layout-container') return
  formDesignerStore.moveChildInContainer(selectedComponent.value.id, fromIndex, toIndex)
  toast.success('组件已移动')
}

// 使用拖拽 composable
const {
  draggingIndex: draggingChildIndex,
  dragOverIndex: dragOverChildIndex,
  startDrag,
  handleDragOver: handleChildDragOverBase,
  resetDragState
} = useDragAndDrop()

// 属性面板中拖拽开始（包装 composable 方法）
const handleChildDragStart = (index: number, event: DragEvent) => {
  startDrag(index, event)
}

// 属性面板中拖拽悬停（包装 composable 方法）
const handleChildDragOver = (event: DragEvent, index: number) => {
  handleChildDragOverBase(event, index)
}

// 属性面板中拖拽放下
const handleChildDrop = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()

  if (draggingChildIndex.value === null) return

  const fromIndex = draggingChildIndex.value
  const toIndex = dragOverChildIndex.value >= 0 ? dragOverChildIndex.value : -1

  if (fromIndex !== toIndex && toIndex >= 0) {
    moveChildInLayoutContainer(fromIndex, toIndex)
  }

  // 重置状态
  resetDragState()
}

// 页签容器
const addTabToTabsContainer = () => {
  if (!selectedComponent.value || selectedComponent.value.type !== 'tabs-container') return
  try {
    formDesignerStore.addTabToTabsContainer(selectedComponent.value.id)
    toast.success('标签页已添加')
  } catch (error) {
    toast.error('添加标签页失败')
  }
}

const removeTabFromTabsContainer = (tabName: string) => {
  if (!selectedComponent.value) return
  try {
    formDesignerStore.removeTabFromTabsContainer(selectedComponent.value.id, tabName)
    toast.success('标签页已删除')
  } catch (error: any) {
    toast.error(error.message || '删除标签页失败')
  }
}

const updateTabLabel = (tabName: string, label: string) => {
  if (!selectedComponent.value || selectedComponent.value.type !== 'tabs-container') return
  const tabsContainer = selectedComponent.value as TabsContainerComponent
  const tab = tabsContainer.tabs.find(t => t.name === tabName)
  if (tab) {
    tab.label = label
    updateProperty('tabs', tabsContainer.tabs)
  }
}

const addChildToTab = (tabName: string) => {
  if (!selectedComponent.value) return
  try {
    formDesignerStore.addChildToTab(selectedComponent.value.id, tabName, 'input')
    toast.success('组件已添加')
  } catch (error) {
    toast.error('添加组件失败')
  }
}

const removeChildFromTab = (tabName: string, childId: string) => {
  if (!selectedComponent.value) return
  formDesignerStore.removeChildFromContainer(selectedComponent.value.id, childId)
  toast.success('组件已删除')
}

// 栅格容器
const addColumnToGridContainer = () => {
  if (!selectedComponent.value || selectedComponent.value.type !== 'grid-container') return
  try {
    formDesignerStore.addColumnToGridContainer(selectedComponent.value.id)
    toast.success('列已添加')
  } catch (error: any) {
    toast.error(error.message || '添加列失败')
  }
}

const removeColumnFromGridContainer = (columnIndex: number) => {
  if (!selectedComponent.value) return
  try {
    formDesignerStore.removeColumnFromGridContainer(selectedComponent.value.id, columnIndex)
    toast.success('列已删除')
  } catch (error: any) {
    toast.error(error.message || '删除列失败')
  }
}

const updateColumnSpan = (columnIndex: number, span: number) => {
  if (!selectedComponent.value || selectedComponent.value.type !== 'grid-container') return
  const gridContainer = selectedComponent.value as GridContainerComponent
  const column = gridContainer.columns[columnIndex]
  if (column) {
    column.span = span
    updateProperty('columns', gridContainer.columns)
  }
}

const addChildToColumn = (columnIndex: number) => {
  if (!selectedComponent.value) return
  try {
    formDesignerStore.addChildToGridColumn(selectedComponent.value.id, columnIndex, 'input')
    toast.success('组件已添加')
  } catch (error) {
    toast.error('添加组件失败')
  }
}

const removeChildFromColumn = (columnIndex: number, childId: string) => {
  if (!selectedComponent.value) return
  formDesignerStore.removeChildFromContainer(selectedComponent.value.id, childId)
  toast.success('组件已删除')
}
</script>

<template>
  <div class="properties-panel">
    <Tabs v-model="activeTab" class="prop-tabs">
      <TabsList>
        <TabsTrigger value="component">组件属性</TabsTrigger>
        <TabsTrigger value="form">表单设置</TabsTrigger>
      </TabsList>

      <!-- 组件属性 -->
      <TabsContent value="component">
        <!-- 无选择状态 -->
        <div v-if="!hasSelection" class="no-selection">
          <div class="empty-state">
            <!-- <Icon icon="lucide:mouse-pointer" class="w-16 h-16 text-gray-300" /> -->
            <p class="text-gray-500 text-sm">请选择组件查看属性</p>
          </div>
        </div>

        <!-- 属性配置内容（分类标题 + 内容） -->
        <div v-else class="panel-content">
          <!-- 基础属性 -->
          <div class="section">
            <div class="section-title">
              <span>基础属性</span>
            </div>
            <div class="section-body">
              <!-- space-y-4 -->
              <div class="">
                <div class="form-group">
                  <Label class="form-label">标签</Label>
                  <Input :model-value="selectedComponent?.label ?? ''"
                    @update:model-value="updateProperty('label', $event)" placeholder="请输入标签" />
                </div>

                <div class="form-group">
                  <Label class="form-label">字段名</Label>
                  <Input :model-value="selectedComponent?.name ?? ''" disabled placeholder="字段名自动生成" />
                </div>

                <!-- 容器组件不显示占位符、默认值、必填、禁用 -->
                <template v-if="!isContainerComponent">
                  <div class="form-group">
                    <Label class="form-label">占位符</Label>
                    <Input
                      :model-value="(selectedComponent && selectedComponent.placeholder) ? selectedComponent.placeholder : ''"
                      @update:model-value="updateProperty('placeholder', $event)" placeholder="请输入占位符" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">默认值</Label>
                    <template v-if="selectedComponent && selectedComponent.type === 'switch'">
                      <Switch :model-value="(selectedComponent as any).defaultValue ?? false"
                        @update:model-value="updateProperty('defaultValue', $event)" />
                    </template>
                    <template
                      v-else-if="selectedComponent && ['input-number', 'slider', 'rate'].includes(selectedComponent.type)">
                      <Input type="number" :model-value="String((selectedComponent as any).defaultValue ?? 0)"
                        @update:model-value="updateProperty('defaultValue', Number($event))" />
                    </template>
                    <template v-else>
                      <Input :model-value="String((selectedComponent as any)?.defaultValue ?? '')"
                        @update:model-value="updateProperty('defaultValue', $event)" />
                    </template>
                  </div>

                  <div class="form-group">
                    <Label class="form-label">必填</Label>
                    <Switch :model-value="selectedComponent?.required || false"
                      @update:model-value="updateProperty('required', $event)" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">禁用</Label>
                    <Switch :model-value="selectedComponent?.disabled || false"
                      @update:model-value="updateProperty('disabled', $event)" />
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- 高级属性 -->
          <div v-if="!isContainerComponent" class="section">
            <div class="section-title">
              <span>高级属性</span>
            </div>
            <div class="section-body">
              <!-- 输入框特殊属性 -->
              <template v-if="selectedComponent && selectedComponent.type === 'input'">
                <!-- space-y-4 -->
                <div class="">
                  <div class="form-group">
                    <Label class="form-label">输入类型</Label>
                    <Select :model-value="(selectedComponent as any).inputType || 'text'"
                      @update:model-value="updateProperty('inputType', $event)">
                      <SelectTrigger>
                        <SelectValue placeholder="请选择输入类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">文本</SelectItem>
                        <SelectItem value="password">密码</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="form-group">
                    <Label class="form-label">最大长度</Label>
                    <Input type="number" :model-value="String((selectedComponent as any).maxlength || '')"
                      @update:model-value="updateProperty('maxlength', $event ? Number($event) : undefined)" :min="1" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">最小长度</Label>
                    <Input type="number" :model-value="String((selectedComponent as any).minlength || '')"
                      @update:model-value="updateProperty('minlength', $event ? Number($event) : undefined)" :min="1" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">显示清除</Label>
                    <Switch :model-value="(selectedComponent as any).clearable || false"
                      @update:model-value="updateProperty('clearable', $event)" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">显示字数统计</Label>
                    <Switch :model-value="(selectedComponent as any).showWordLimit || false"
                      @update:model-value="updateProperty('showWordLimit', $event)" />
                  </div>

                  <div v-if="(selectedComponent as any).showWordLimit" class="form-group">
                    <Label class="form-label">字数统计位置</Label>
                    <Select :model-value="(selectedComponent as any).wordLimitPosition || 'inside'"
                      @update:model-value="updateProperty('wordLimitPosition', $event)">
                      <SelectTrigger>
                        <SelectValue placeholder="请选择位置" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inside">内部</SelectItem>
                        <SelectItem value="outside">外部</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div v-if="(selectedComponent as any).inputType === 'password'" class="form-group">
                    <Label class="form-label">显示密码切换</Label>
                    <Switch :model-value="(selectedComponent as any).showPassword || false"
                      @update:model-value="updateProperty('showPassword', $event)" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">只读</Label>
                    <Switch :model-value="(selectedComponent as any).readonly || false"
                      @update:model-value="updateProperty('readonly', $event)" />
                  </div>

                  <div v-if="(selectedComponent as any).inputType === 'textarea'" class="form-group">
                    <Label class="form-label">自适应高度</Label>
                    <Switch :model-value="(selectedComponent as any).autosize || false"
                      @update:model-value="updateProperty('autosize', $event)" />
                  </div>

                  <div v-if="(selectedComponent as any).inputType === 'textarea'" class="form-group">
                    <Label class="form-label">调整大小</Label>
                    <Select :model-value="(selectedComponent as any).resize"
                      @update:model-value="updateProperty('resize', $event)">
                      <SelectTrigger>
                        <SelectValue placeholder="请选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">无</SelectItem>
                        <SelectItem value="horizontal">水平</SelectItem>
                        <SelectItem value="vertical">垂直</SelectItem>
                        <SelectItem value="both">双向</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div v-if="(selectedComponent as any).inputType === 'textarea'" class="form-group">
                    <Label class="form-label">行数</Label>
                    <Input type="number" :model-value="String((selectedComponent as any).rows || 4)"
                      @update:model-value="updateProperty('rows', $event ? Number($event) : 4)" :min="2" :max="10" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">自动聚焦</Label>
                    <Switch :model-value="(selectedComponent as any).autofocus || false"
                      @update:model-value="updateProperty('autofocus', $event)" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">尺寸</Label>
                    <Select :model-value="(selectedComponent as any).size"
                      @update:model-value="updateProperty('size', $event)">
                      <SelectTrigger>
                        <SelectValue placeholder="请选择尺寸" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="large">大</SelectItem>
                        <SelectItem value="default">默认</SelectItem>
                        <SelectItem value="small">小</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="form-group">
                    <Label class="form-label">自动完成</Label>
                    <Input :model-value="(selectedComponent as any).autocomplete || 'off'"
                      @update:model-value="updateProperty('autocomplete', $event)" placeholder="off" />
                  </div>
                </div>
              </template>

              <!-- 多行文本特殊属性 -->
              <template v-if="selectedComponent && selectedComponent.type === 'textarea'">
                <!-- space-y-4 -->
                <div class="">
                  <div class="form-group">
                    <Label class="form-label">行数</Label>
                    <Input type="number" :model-value="String((selectedComponent as any).rows || 4)"
                      @update:model-value="updateProperty('rows', $event ? Number($event) : 4)" :min="2" :max="20" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">自适应高度</Label>
                    <Switch :model-value="(selectedComponent as any).autosize || false"
                      @update:model-value="updateProperty('autosize', $event)" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">调整大小</Label>
                    <Select :model-value="(selectedComponent as any).resize"
                      @update:model-value="updateProperty('resize', $event)">
                      <SelectTrigger>
                        <SelectValue placeholder="请选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">无</SelectItem>
                        <SelectItem value="horizontal">水平</SelectItem>
                        <SelectItem value="vertical">垂直</SelectItem>
                        <SelectItem value="both">双向</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="form-group">
                    <Label class="form-label">显示字数统计</Label>
                    <Switch :model-value="(selectedComponent as any).showWordLimit || false"
                      @update:model-value="updateProperty('showWordLimit', $event)" />
                  </div>

                  <div v-if="(selectedComponent as any).showWordLimit" class="form-group">
                    <Label class="form-label">字数统计位置</Label>
                    <Select :model-value="(selectedComponent as any).wordLimitPosition || 'inside'"
                      @update:model-value="updateProperty('wordLimitPosition', $event)">
                      <SelectTrigger>
                        <SelectValue placeholder="请选择位置" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inside">内部</SelectItem>
                        <SelectItem value="outside">外部</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="form-group">
                    <Label class="form-label">只读</Label>
                    <Switch :model-value="(selectedComponent as any).readonly || false"
                      @update:model-value="updateProperty('readonly', $event)" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">自动聚焦</Label>
                    <Switch :model-value="(selectedComponent as any).autofocus || false"
                      @update:model-value="updateProperty('autofocus', $event)" />
                  </div>
                </div>
              </template>

              <!-- 数字输入特殊属性 -->
              <template v-if="selectedComponent && selectedComponent.type === 'number'">
                <!-- space-y-4 -->
                <div class="">
                  <div class="form-group">
                    <Label class="form-label">最小值</Label>
                    <Input type="number" :model-value="String((selectedComponent as any).min || '')"
                      @update:model-value="updateProperty('min', $event ? Number($event) : undefined)" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">最大值</Label>
                    <Input type="number" :model-value="String((selectedComponent as any).max || '')"
                      @update:model-value="updateProperty('max', $event ? Number($event) : undefined)" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">步长</Label>
                    <Input type="number" :model-value="String((selectedComponent as any).step || 1)"
                      @update:model-value="updateProperty('step', $event ? Number($event) : 1)" :step="0.01" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">精度</Label>
                    <Input type="number" :model-value="String((selectedComponent as any).precision || '')"
                      @update:model-value="updateProperty('precision', $event ? Number($event) : undefined)" :min="0"
                      :max="20" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">显示控制按钮</Label>
                    <Switch :model-value="(selectedComponent as any).controls !== false"
                      @update:model-value="updateProperty('controls', $event)" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">控制按钮位置</Label>
                    <Select :model-value="(selectedComponent as any).controlsPosition || 'right'"
                      @update:model-value="updateProperty('controlsPosition', $event)">
                      <SelectTrigger>
                        <SelectValue placeholder="请选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">右侧</SelectItem>
                        <SelectItem value="">默认</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="form-group">
                    <Label class="form-label">只读</Label>
                    <Switch :model-value="(selectedComponent as any).readonly || false"
                      @update:model-value="updateProperty('readonly', $event)" />
                  </div>

                  <div class="form-group">
                    <Label class="form-label">尺寸</Label>
                    <Select :model-value="(selectedComponent as any).size"
                      @update:model-value="updateProperty('size', $event)">
                      <SelectTrigger>
                        <SelectValue placeholder="请选择尺寸" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="large">大</SelectItem>
                        <SelectItem value="default">默认</SelectItem>
                        <SelectItem value="small">小</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="form-group">
                    <Label class="form-label">严格步进</Label>
                    <Switch :model-value="(selectedComponent as any).stepStrictly || false"
                      @update:model-value="updateProperty('stepStrictly', $event)" />
                  </div>
                </div>
              </template>

            </div>
          </div>

          <!-- 布局：组件宽度（span） -->
          <div v-if="!isContainerComponent" class="section">
            <div class="section-title">
              <span>布局</span>
            </div>
            <div class="section-body">
              <div class="space-y-4">
                <div class="form-group">
                  <Label class="form-label">组件宽度</Label>
                  <div class="layout-row">
                    <Input type="number"
                      :model-value="String((selectedComponent && selectedComponent.span != null) ? selectedComponent.span : 24)"
                      @update:model-value="updateProperty('span', $event ? Number($event) : 24)" :min="1" :max="24"
                      class="w-[110px]" />
                    <span style="margin-left: 8px; color: var(--text-muted);">/ 24 ({{ Math.round(((selectedComponent &&
                      selectedComponent.span != null) ? selectedComponent.span : 24) / 24 * 100) }}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 选项配置 -->
          <div v-if="selectedComponent && ['select', 'radio', 'checkbox'].includes(selectedComponent.type)"
            class="section">
            <div class="section-title">
              <span>选项配置</span>
            </div>
            <Button variant="default" size="sm" @click="addOption" class="w-full">
              <Icon icon="foller" class="w-4 h-4 mr-1" />添加选项
            </Button>
            <div class="section-body">
              <div class="options-list">
                <div v-for="(option, index) in (selectedComponent as any).options" :key="index" class="option-item">
                  <div class="space-y-3">
                    <div class="form-group">
                      <Label class="form-label">标签</Label>
                      <Input :model-value="option.label" @update:model-value="updateOption(index, 'label', $event)" />
                    </div>

                    <div class="form-group">
                      <Label class="form-label">值</Label>
                      <Input :model-value="option.value" @update:model-value="updateOption(index, 'value', $event)" />
                    </div>

                    <div class="form-group">
                      <Label class="form-label">禁用</Label>
                      <div class="option-controls">
                        <Switch :model-value="option.disabled || false"
                          @change="updateOption(index, 'disabled', $event)" />
                        <Button variant="destructive" size="sm" @click="removeOption(index)"
                          :disabled="(selectedComponent as any).options.length <= 1">
                          <Icon icon="lucide:trash-2" class="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 验证规则 -->
          <div v-if="!isContainerComponent" class="section">
            <div class="section-title">
              <span>验证规则</span>
            </div>
            <Button variant="default" size="sm" @click="addValidationRule" class="w-full">
              <Icon icon="foller" class="w-4 h-4 mr-1" />添加规则
            </Button>
            <div class="section-body">
              <div v-if="!selectedComponent?.rules || selectedComponent?.rules.length === 0" class="validation-empty">
                <Icon icon="lucide:shield-alert" class="w-12 h-12 text-gray-300 mb-3" />
                <p class="text-gray-400 text-sm">暂无验证规则</p>
                <p class="text-gray-400 text-xs mt-1">点击"添加规则"创建验证规则</p>
              </div>

              <div v-else class="validation-list">
                <div v-for="(rule, index) in (selectedComponent?.rules || [])" :key="index" class="validation-card">
                  <div class="validation-card-header">
                    <div class="validation-card-title">
                      <Icon icon="lucide:shield-check" class="w-4 h-4 text-primary" />
                      <span>规则 #{{ index + 1 }}</span>
                    </div>
                    <Button variant="ghost" size="sm" @click="removeValidationRule(index)">
                      <Icon icon="lucide:trash-2" class="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <div class="validation-card-body">
                    <div class="validation-field">
                      <Label class="validation-label">必填验证</Label>
                      <div class="validation-control">
                        <Switch :model-value="rule.required || false"
                          @update:model-value="updateValidationRule(index, 'required', $event)" />
                        <span class="validation-value">{{ rule.required ? '是' : '否' }}</span>
                      </div>
                    </div>
                    <div class="validation-field">
                      <Label class="validation-label">触发时机</Label>
                      <div class="validation-control">
                        <Select :model-value="rule.trigger || 'blur'"
                          @update:model-value="updateValidationRule(index, 'trigger', $event)" class="flex-1">
                          <SelectTrigger class="w-full">
                            <SelectValue placeholder="请选择触发时机" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blur">失焦时 (blur)</SelectItem>
                            <SelectItem value="change">改变时 (change)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div class="validation-field validation-field-full">
                      <Label class="validation-label">错误信息</Label>
                      <Input :model-value="rule.message || ''"
                        @update:model-value="updateValidationRule(index, 'message', $event)"
                        placeholder="请输入验证失败时的提示信息" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 容器组件配置 -->
          <!-- 布局容器 -->
          <div v-if="selectedComponent && selectedComponent.type === 'layout-container'">
            <!-- 基础样式 -->
            <div class="section">
              <div class="section-title">
                <span>基础样式</span>
              </div>
              <div class="section-body">
                <div class="space-y-4">
                  <div class="form-group">
                    <Label class="form-label">显示边框</Label>
                    <Switch :model-value="(selectedComponent as LayoutContainerComponent).showBorder !== false"
                      @update:model-value="updateProperty('showBorder', $event)" />
                  </div>
                  <div class="form-group">
                    <Label class="form-label">显示背景</Label>
                    <Switch :model-value="(selectedComponent as LayoutContainerComponent).showBackground !== false"
                      @update:model-value="updateProperty('showBackground', $event)" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 颜色设置 -->
            <div class="section">
              <div class="section-title">
                <Separator><span>颜色设置</span></Separator>
              </div>
              <div class="section-body">
                <div class="space-y-4">
                  <div v-if="(selectedComponent as LayoutContainerComponent).showBackground !== false"
                    class="form-group">
                    <Label class="form-label">背景颜色</Label>
                    <Input :model-value="(selectedComponent as LayoutContainerComponent).backgroundColor || ''"
                      @update:model-value="updateProperty('backgroundColor', $event)" type="color" />
                  </div>
                  <div v-if="(selectedComponent as LayoutContainerComponent).showBorder !== false" class="form-group">
                    <Label class="form-label">边框颜色</Label>
                    <Input :model-value="(selectedComponent as LayoutContainerComponent).borderColor || ''"
                      @update:model-value="updateProperty('borderColor', $event)" type="color" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 间距设置 -->
            <div class="section">
              <div class="section-title">
                <span>间距设置</span>
              </div>
              <div class="section-body">
                <div class="space-y-4">
                  <div class="form-group">
                    <Label class="form-label">内边距</Label>
                    <div class="flex gap-2">
                      <Select
                        :model-value="getPaddingSelectState(selectedComponent.id, (selectedComponent as LayoutContainerComponent).padding || '12px')"
                        @update:model-value="(val) => handlePaddingChange(val, selectedComponent.id, (selectedComponent as LayoutContainerComponent).padding || '12px')"
                        class="w-[100px]">
                        <SelectTrigger>
                          <SelectValue placeholder="预设值" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0px">0px</SelectItem>
                          <SelectItem value="8px">8px</SelectItem>
                          <SelectItem value="12px">12px</SelectItem>
                          <SelectItem value="16px">16px</SelectItem>
                          <SelectItem value="20px">20px</SelectItem>
                          <SelectItem value="24px">24px</SelectItem>
                          <SelectItem value="custom">自定义</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        v-if="shouldShowPaddingInput(selectedComponent.id, (selectedComponent as LayoutContainerComponent).padding || '12px')"
                        :model-value="(selectedComponent as LayoutContainerComponent).padding || '12px'"
                        @update:model-value="updateProperty('padding', $event)" placeholder="如: 12px 或 8px 16px"
                        class="flex-1" />
                    </div>
                  </div>
                  <div class="form-group">
                    <Label class="form-label">外边距</Label>
                    <div class="flex gap-2">
                      <Select
                        :model-value="getMarginSelectState(selectedComponent.id, (selectedComponent as LayoutContainerComponent).margin || '0px')"
                        @update:model-value="(val) => handleMarginChange(val, selectedComponent.id, (selectedComponent as LayoutContainerComponent).margin || '0px')"
                        class="w-[100px]">
                        <SelectTrigger>
                          <SelectValue placeholder="预设值" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0px">0px</SelectItem>
                          <SelectItem value="8px">8px</SelectItem>
                          <SelectItem value="12px">12px</SelectItem>
                          <SelectItem value="16px">16px</SelectItem>
                          <SelectItem value="20px">20px</SelectItem>
                          <SelectItem value="24px">24px</SelectItem>
                          <SelectItem value="custom">自定义</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        v-if="shouldShowMarginInput(selectedComponent.id, (selectedComponent as LayoutContainerComponent).margin || '0px')"
                        :model-value="(selectedComponent as LayoutContainerComponent).margin || '0px'"
                        @update:model-value="updateProperty('margin', $event)" placeholder="如: 0px 或 8px 16px"
                        class="flex-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 尺寸设置 -->
            <div class="section">
              <div class="section-title">
                <span>尺寸设置</span>
              </div>
              <div class="section-body">
                <div class="space-y-4">
                  <div class="form-group">
                    <Label class="form-label">圆角</Label>
                    <div class="flex gap-2">
                      <Select
                        :model-value="getBorderRadiusPreset((selectedComponent as LayoutContainerComponent).borderRadius || '4px')"
                        @update:model-value="(val) => { if (val !== 'custom') updateProperty('borderRadius', val) }"
                        class="w-[100px]">
                        <SelectTrigger>
                          <SelectValue placeholder="预设值" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0px">0px</SelectItem>
                          <SelectItem value="4px">4px</SelectItem>
                          <SelectItem value="8px">8px</SelectItem>
                          <SelectItem value="12px">12px</SelectItem>
                          <SelectItem value="16px">16px</SelectItem>
                          <SelectItem value="custom">自定义</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        v-if="getBorderRadiusPreset((selectedComponent as LayoutContainerComponent).borderRadius || '4px') === 'custom'"
                        :model-value="(selectedComponent as LayoutContainerComponent).borderRadius || '4px'"
                        @update:model-value="updateProperty('borderRadius', $event)" placeholder="如: 4px"
                        class="flex-1" />
                    </div>
                  </div>
                  <div class="form-group">
                    <Label class="form-label">最小高度</Label>
                    <div class="flex gap-2">
                      <Select
                        :model-value="getMinHeightPreset((selectedComponent as LayoutContainerComponent).minHeight || '60px')"
                        @update:model-value="(val) => { if (val !== 'custom') updateProperty('minHeight', val) }"
                        class="w-[100px]">
                        <SelectTrigger>
                          <SelectValue placeholder="预设值" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">auto</SelectItem>
                          <SelectItem value="60px">60px</SelectItem>
                          <SelectItem value="100px">100px</SelectItem>
                          <SelectItem value="150px">150px</SelectItem>
                          <SelectItem value="200px">200px</SelectItem>
                          <SelectItem value="custom">自定义</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        v-if="getMinHeightPreset((selectedComponent as LayoutContainerComponent).minHeight || '60px') === 'custom'"
                        :model-value="(selectedComponent as LayoutContainerComponent).minHeight || '60px'"
                        @update:model-value="updateProperty('minHeight', $event)" placeholder="如: 60px"
                        class="flex-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 子组件管理 -->
            <div class="section">
              <div class="section-title">
                <span>子组件管理</span>

              </div>
              <Button variant="default" size="sm" @click="addChildToLayoutContainer" class="w-full">
                <Icon icon="foller" class="w-4 h-4 mr-1" />添加组件
              </Button>
              <div class="section-body">
                <div v-if="(selectedComponent as LayoutContainerComponent).children.length === 0" class="no-rules">
                  <span class="text-gray-500">暂无子组件，点击"添加组件"或拖拽组件到容器内</span>
                </div>
                <div v-else class="children-list">
                  <div v-for="(child, index) in (selectedComponent as LayoutContainerComponent).children"
                    :key="child.id" class="child-item" :class="{
                      'child-selected': child.id === formDesignerStore.selectedComponentId,
                      'drag-over': dragOverChildIndex === index
                    }" draggable="true" @dragstart="handleChildDragStart(index, $event)"
                    @dragover="handleChildDragOver($event, index)" @drop="handleChildDrop($event)">
                    <div class="child-info">
                      <span class="child-icon">📋</span>
                      <span class="child-label" @click="selectChildComponent(child.id)"
                        :title="child.label || child.type">{{
                          child.label || child.type }}</span>
                      <span class="child-type">{{ child.type }}</span>
                    </div>
                    <div class="child-actions">
                      <Button v-if="index > 0" size="sm" variant="ghost"
                        @click="moveChildInLayoutContainer(index, index - 1)" title="上移"
                        class="child-action-btn">↑</Button>
                      <Button v-if="index < (selectedComponent as LayoutContainerComponent).children.length - 1"
                        size="sm" variant="ghost" @click="moveChildInLayoutContainer(index, index + 1)" title="下移"
                        class="child-action-btn">↓</Button>
                      <Button size="sm" variant="destructive" @click="removeChildFromLayoutContainer(child.id)"
                        title="删除" class="child-action-btn">×</Button>
                    </div>
                    <div v-if="dragOverChildIndex === index" class="drop-indicator"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 页签容器 -->
          <div v-if="selectedComponent && selectedComponent.type === 'tabs-container'">
            <!-- 页签属性配置 -->
            <div class="section">
              <div class="section-title">
                <span>页签属性</span>
              </div>
              <div class="section-body">
                <div class="container-settings">
                  <div class="form-group">
                    <Label class="form-label">标签类型</Label>
                    <Select :model-value="(selectedComponent as TabsContainerComponent).tabType || ''"
                      @update:model-value="updateProperty('tabType', $event)">
                      <SelectTrigger>
                        <SelectValue placeholder="请选择标签类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">普通</SelectItem>
                        <SelectItem value="card">卡片</SelectItem>
                        <SelectItem value="border-card">边框卡片</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div class="form-group">
                    <Label class="form-label">标签位置</Label>
                    <Select :model-value="(selectedComponent as TabsContainerComponent).tabPosition || 'top'"
                      @update:model-value="updateProperty('tabPosition', $event)">
                      <SelectTrigger>
                        <SelectValue placeholder="请选择标签位置" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">顶部</SelectItem>
                        <SelectItem value="right">右侧</SelectItem>
                        <SelectItem value="bottom">底部</SelectItem>
                        <SelectItem value="left">左侧</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div class="form-group">
                    <Label class="form-label">宽度自撑开</Label>
                    <Switch :model-value="(selectedComponent as TabsContainerComponent).stretch || false"
                      @update:model-value="updateProperty('stretch', $event)" />
                  </div>
                  <div class="form-group">
                    <Label class="form-label">可关闭</Label>
                    <Switch :model-value="(selectedComponent as TabsContainerComponent).closable || false"
                      @update:model-value="updateProperty('closable', $event)" />
                  </div>
                  <div class="form-group">
                    <Label class="form-label">可增加</Label>
                    <Switch :model-value="(selectedComponent as TabsContainerComponent).addable || false"
                      @update:model-value="updateProperty('addable', $event)" />
                  </div>
                  <div class="form-group">
                    <Label class="form-label">可编辑</Label>
                    <Switch :model-value="(selectedComponent as TabsContainerComponent).editable || false"
                      @update:model-value="updateProperty('editable', $event)" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 间距设置 -->
            <div class="section">
              <div class="section-title">
                <span>间距设置</span>
              </div>
              <div class="section-body">
                <div class="container-settings">
                  <div class="form-group">
                    <Label class="form-label">内边距</Label>
                    <div style="display: flex; gap: 8px;">
                      <Select
                        :model-value="getPaddingSelectState(selectedComponent.id, (selectedComponent as TabsContainerComponent).padding || '0px')"
                        @update:model-value="(val) => handlePaddingChange(val, selectedComponent.id, (selectedComponent as TabsContainerComponent).padding || '0px')"
                        style="width: 100px;">
                        <SelectTrigger>
                          <SelectValue placeholder="预设值" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0px">0px</SelectItem>
                          <SelectItem value="8px">8px</SelectItem>
                          <SelectItem value="12px">12px</SelectItem>
                          <SelectItem value="16px">16px</SelectItem>
                          <SelectItem value="20px">20px</SelectItem>
                          <SelectItem value="24px">24px</SelectItem>
                          <SelectItem value="custom">自定义</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        v-if="shouldShowPaddingInput(selectedComponent.id, (selectedComponent as TabsContainerComponent).padding || '0px')"
                        :model-value="(selectedComponent as TabsContainerComponent).padding || '0px'"
                        @update:model-value="updateProperty('padding', $event)" placeholder="如: 12px 或 8px 16px"
                        style="flex: 1;" />
                    </div>
                  </div>
                  <div class="form-group">
                    <Label class="form-label">外边距</Label>
                    <div style="display: flex; gap: 8px;">
                      <Select
                        :model-value="getMarginSelectState(selectedComponent.id, (selectedComponent as TabsContainerComponent).margin || '0px')"
                        @update:model-value="(val) => handleMarginChange(val, selectedComponent.id, (selectedComponent as TabsContainerComponent).margin || '0px')"
                        style="width: 100px;">
                        <SelectTrigger>
                          <SelectValue placeholder="预设值" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0px">0px</SelectItem>
                          <SelectItem value="8px">8px</SelectItem>
                          <SelectItem value="12px">12px</SelectItem>
                          <SelectItem value="16px">16px</SelectItem>
                          <SelectItem value="20px">20px</SelectItem>
                          <SelectItem value="24px">24px</SelectItem>
                          <SelectItem value="custom">自定义</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        v-if="shouldShowMarginInput(selectedComponent.id, (selectedComponent as TabsContainerComponent).margin || '0px')"
                        :model-value="(selectedComponent as TabsContainerComponent).margin || '0px'"
                        @update:model-value="updateProperty('margin', $event)" placeholder="如: 0px 或 8px 16px"
                        style="flex: 1;" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 标签页管理 -->
            <div class="section">
              <div class="section-title ">
                <span>标签页管理</span>
              </div>
              <Button variant="default" size="sm" @click="addTabToTabsContainer" class="w-full">添加标签页</Button>

              <div class="section-body">
                <div class="tabs-list">
                  <div v-for="(tab, index) in (selectedComponent as TabsContainerComponent).tabs" :key="tab.name"
                    class="tab-item">
                    <div class="tab-settings">
                      <div class="form-group">
                        <Label class="form-label">标签名</Label>
                        <Input :model-value="tab.label" @update:model-value="updateTabLabel(tab.name, $event)" />
                      </div>
                      <div class="form-group">
                        <Label class="form-label">子组件</Label>
                        <div class="tab-children">
                          <div v-for="child in tab.children" :key="child.id" class="child-item">
                            <span>{{ child.label || child.type }}</span>
                            <Button size="sm" variant="destructive"
                              @click="removeChildFromTab(tab.name, child.id)">×</Button>
                          </div>
                          <Button size="sm" variant="default" @click="addChildToTab(tab.name)">
                            + 添加组件
                          </Button>
                        </div>
                      </div>
                      <div class="form-group">
                        <Button size="sm" variant="destructive" @click="removeTabFromTabsContainer(tab.name)"
                          :disabled="(selectedComponent as TabsContainerComponent).tabs.length <= 1">
                          删除标签页
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 栅格容器 -->
          <div v-if="selectedComponent && selectedComponent.type === 'grid-container'">
            <!-- 栅格属性配置 -->
            <div class="section">
              <div class="section-title">
                <span>栅格属性</span>
              </div>
              <div class="section-body">
                <div class="container-settings">
                  <div class="form-group">
                    <Label class="form-label">栅格间距</Label>
                    <Input type="number"
                      :model-value="String((selectedComponent as GridContainerComponent).gutter || 20)"
                      @update:model-value="updateProperty('gutter', Number($event))" min="0" max="100" step="5"
                      style="width: 100px;" />
                  </div>
                  <div class="form-group">
                    <Label class="form-label">水平排列</Label>
                    <Select :model-value="(selectedComponent as GridContainerComponent).justify || 'start'"
                      @update:model-value="updateProperty('justify', $event)">
                      <SelectTrigger>
                        <SelectValue placeholder="请选择水平排列方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="start">左对齐</SelectItem>
                        <SelectItem value="end">右对齐</SelectItem>
                        <SelectItem value="center">居中</SelectItem>
                        <SelectItem value="space-between">两端对齐</SelectItem>
                        <SelectItem value="space-around">环绕对齐</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div class="form-group">
                    <Label class="form-label">垂直对齐</Label>
                    <Select :model-value="(selectedComponent as GridContainerComponent).align || 'top'"
                      @update:model-value="updateProperty('align', $event)">
                      <SelectTrigger>
                        <SelectValue placeholder="请选择垂直对齐方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">顶部对齐</SelectItem>
                        <SelectItem value="middle">居中对齐</SelectItem>
                        <SelectItem value="bottom">底部对齐</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <!-- 间距设置 -->
            <div class="section">
              <div class="section-title">
                <span>间距设置</span>
              </div>
              <div class="section-body">
                <div class="container-settings">
                  <div class="form-group">
                    <Label class="form-label">内边距</Label>
                    <div style="display: flex; gap: 8px;">
                      <Select
                        :model-value="getPaddingSelectState(selectedComponent.id, (selectedComponent as GridContainerComponent).padding || '0px')"
                        @update:model-value="(val) => handlePaddingChange(val, selectedComponent.id, (selectedComponent as GridContainerComponent).padding || '0px')"
                        style="width: 100px;">
                        <SelectTrigger>
                          <SelectValue placeholder="预设值" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0px">0px</SelectItem>
                          <SelectItem value="8px">8px</SelectItem>
                          <SelectItem value="12px">12px</SelectItem>
                          <SelectItem value="16px">16px</SelectItem>
                          <SelectItem value="20px">20px</SelectItem>
                          <SelectItem value="24px">24px</SelectItem>
                          <SelectItem value="custom">自定义</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        v-if="shouldShowPaddingInput(selectedComponent.id, (selectedComponent as GridContainerComponent).padding || '0px')"
                        :model-value="(selectedComponent as GridContainerComponent).padding || '0px'"
                        @update:model-value="updateProperty('padding', $event)" placeholder="如: 12px 或 8px 16px"
                        style="flex: 1;" />
                    </div>
                  </div>
                  <div class="form-group">
                    <Label class="form-label">外边距</Label>
                    <div style="display: flex; gap: 8px;">
                      <Select
                        :model-value="getMarginSelectState(selectedComponent.id, (selectedComponent as GridContainerComponent).margin || '0px')"
                        @update:model-value="(val) => handleMarginChange(val, selectedComponent.id, (selectedComponent as GridContainerComponent).margin || '0px')"
                        style="width: 100px;">
                        <SelectTrigger>
                          <SelectValue placeholder="预设值" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0px">0px</SelectItem>
                          <SelectItem value="8px">8px</SelectItem>
                          <SelectItem value="12px">12px</SelectItem>
                          <SelectItem value="16px">16px</SelectItem>
                          <SelectItem value="20px">20px</SelectItem>
                          <SelectItem value="24px">24px</SelectItem>
                          <SelectItem value="custom">自定义</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        v-if="shouldShowMarginInput(selectedComponent.id, (selectedComponent as GridContainerComponent).margin || '0px')"
                        :model-value="(selectedComponent as GridContainerComponent).margin || '0px'"
                        @update:model-value="updateProperty('margin', $event)" placeholder="如: 0px 或 8px 16px"
                        style="flex: 1;" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 列管理 -->
            <div class="section">
              <div class="section-title ">
                <span>列管理</span>
              </div>
              <Button variant="default" size="sm" @click="addColumnToGridContainer" class="w-full">添加列</Button>

              <div class="section-body">
                <div class="columns-list">
                  <div v-for="(column, index) in (selectedComponent as GridContainerComponent).columns" :key="index"
                    class="column-item">
                    <div class="column-settings">
                      <div class="form-group">
                        <Label class="form-label">宽度</Label>
                        <Input type="number" :model-value="String(column.span)"
                          @update:model-value="updateColumnSpan(index, Number($event))" min="1" max="24"
                          style="width: 100px;" />
                        <span style="margin-left: 8px; color: var(--text-muted);">/ 24</span>
                      </div>
                      <div class="form-group">
                        <Label class="form-label">子组件</Label>
                        <div class="column-children">
                          <div v-for="child in column.children" :key="child.id" class="child-item">
                            <span>{{ child.label || child.type }}</span>
                            <Button size="sm" variant="destructive"
                              @click="removeChildFromColumn(index, child.id)">×</Button>
                          </div>
                          <Button size="sm" variant="default" @click="addChildToColumn(index)">
                            + 添加组件
                          </Button>
                        </div>
                      </div>
                      <div class="form-group">
                        <Button size="sm" variant="destructive" @click="removeColumnFromGridContainer(index)"
                          :disabled="(selectedComponent as GridContainerComponent).columns.length <= 1">
                          删除列
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <!-- 表单设置（全局） -->
      <TabsContent value="form">
        <div class="panel-content">
          <!-- 基础设置 -->
          <div class="section">
            <div class="section-title">
              <span>基础设置</span>
            </div>
            <div class="section-body">
              <div class="form-settings">
                <div class="form-field">
                  <Label class="form-label">标签位置</Label>
                  <RadioGroup :model-value="formDesignerStore.currentForm.labelPosition || 'right'"
                    @update:model-value="formDesignerStore.updateFormConfig({ labelPosition: $event })"
                    class="flex space-x-4">
                    <div class="flex items-center space-x-2">
                      <RadioGroupItem value="top" id="label-position-top" />
                      <Label for="label-position-top">上下</Label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <RadioGroupItem value="right" id="label-position-right" />
                      <Label for="label-position-right">右对齐</Label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <RadioGroupItem value="left" id="label-position-left" />
                      <Label for="label-position-left">左对齐</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div class="form-field">
                  <Label class="form-label">标签宽度</Label>
                  <Input :model-value="formDesignerStore.currentForm.labelWidth || '120px'"
                    @update:model-value="formDesignerStore.updateFormConfig({ labelWidth: $event })"
                    placeholder="如 120px 或 8em" />
                </div>
              </div>
            </div>
          </div>

          <!-- 显示规则 -->
          <div class="section">
            <div class="section-title">
              <span>表单规则配置</span>
            </div>
            <div class="section-body">
              <DisplayRulesConfig component-id="form" :rules="formDesignerStore.currentForm.displayRules"
                @update:rules="updateFormDisplayRules" />
            </div>
          </div>
        </div>
      </TabsContent>

    </Tabs>
  </div>
</template>

<style scoped lang="scss">
.properties-panel {
  padding: 12px;
  min-height: 100%;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 0px;
  }
}

.prop-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.no-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  min-height: 0;
}

.section {
  margin-bottom: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    position: relative;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background-color: var(--border-0);
    }

    &::before {
      margin-right: 10px;
    }

    &::after {
      margin-left: 10px;
    }


    span {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
    }
  }

  .section-body {
    padding: 10px;
  }
}

.form-group {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.form-field {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.options-list,
.rules-list,
.children-list,
.tabs-list,
.columns-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.children-list {
  gap: 6px;
}

.option-item,
.rule-item,
.tab-item,
.column-item {
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--border-light);
  }
}

.child-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  position: relative;
  cursor: move;
  transition: all 0.2s ease;
  border-radius: 6px;
  border: 1px solid var(--border-color, #e5e7eb);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &.child-selected {
    border-color: var(--primary-color, #6366f1);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }

  &.drag-over {
    border-color: var(--primary-color, #6366f1);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  &[draggable="true"]:hover {
    border-color: var(--border-light, #d1d5db);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  .drop-indicator {
    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--primary-color, #6366f1);
    z-index: 10;
    pointer-events: none;
    border-radius: 1px;
  }

  .child-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;

    .child-icon {
      font-size: 16px;
      color: var(--text-muted, #9ca3af);
      flex-shrink: 0;
      cursor: grab;

      &:active {
        cursor: grabbing;
      }
    }

    .child-label {
      font-size: 13px;
      color: var(--text-primary, #1f2937);
      font-weight: 500;
      cursor: pointer;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: color 0.2s ease;

      &:hover {
        color: var(--primary-color, #6366f1);
      }
    }

    .child-type {
      font-size: 11px;
      color: var(--text-secondary, #6b7280);
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 500;
      flex-shrink: 0;
      border: 1px solid var(--border-color, #e5e7eb);
    }
  }

  .child-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    margin-left: 8px;

    .child-action-btn {
      padding: 4px 8px;
      min-width: auto;
    }
  }
}

.tab-children,
.column-children {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;

  .child-item {
    padding: 8px 10px;
    margin: 0;
  }
}

.option-controls,
.rule-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-controls {
  :deep(.el-select) {
    flex: 1;
  }
}

.no-rules {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary);
  font-size: 13px;
}

.layout-row {
  display: flex;
  align-items: center;
}

.container-settings {
  .form-group {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.tab-settings,
.column-settings {
  .form-group {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>