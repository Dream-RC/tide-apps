<script setup lang="ts">
import { computed, ref, watch, onMounted, inject } from 'vue'
import type { FormComponent, InputComponent, SelectComponent, RadioComponent, CheckboxComponent, DatePickerComponent, TimePickerComponent, InputNumberComponent, SliderComponent, SwitchComponent, RateComponent, UploadComponent, ColorPickerComponent, UserSelectComponent, DepartmentSelectComponent, RoleSelectComponent, LayoutContainerComponent, TabsContainerComponent, GridContainerComponent } from '@/types/form'
import Dropfile from '@/components/chronos-ui/drop-file/Dropfile.vue'
import { getLayoutContainerStyle, getGridContainerStyle, getGridColumnStyle } from './utils/containerStyles'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

// 显示规则接口定义
interface DisplayRule {
  targetField: string
  triggerField: string
  condition: string
  value?: any
  valueType?: 'static' | 'field'
  action: string
  logic?: 'and' | 'or'
}

// Props定义
interface Props {
  component: FormComponent
  modelValue?: any
  disabled?: boolean
  readonly?: boolean // 是否只读（与disabled类似，但语义更明确）
  preview?: boolean // 是否为预览模式
}

// Emits定义
interface Emits {
  (e: 'update:modelValue', value: any): void
  (e: 'change', value: any): void
  (e: 'blur', event: Event): void
  (e: 'focus', event: Event): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false
})

const emit = defineEmits<Emits>()

// 在预览模式下，尝试从父级注入的 formData 和 formConfig 获取值
const formData = inject<Record<string, any>>('formData', {})
const formConfig = inject<any>('formConfig', null)

// FormComponentRenderer 初始化日志已移除

// 内部值：优先使用 modelValue，否则退回到组件的 defaultValue，预览模式下从 formData 获取
const getInitialValue = () => {
  if (props.modelValue !== undefined) {
    return props.modelValue
  }
  if (props.preview && formData && props.component.name) {
    return formData[props.component.name] !== undefined ? formData[props.component.name] : (props.component as any).defaultValue
  }
  return (props.component as any).defaultValue
}

const internalValue = ref(getInitialValue())

// 动态规则状态
const ruleState = ref({
  visible: true,
  disabled: false,
  required: false,
  readonly: false
})

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined) {
    internalValue.value = newValue
  } else if (props.preview && formData && props.component.name) {
    internalValue.value = formData[props.component.name] !== undefined ? formData[props.component.name] : (props.component as any).defaultValue
  } else {
    internalValue.value = (props.component as any).defaultValue
  }
}, { immediate: true })

// 预览模式下，监听 formData 变化
if (props.preview && formData && props.component.name) {
  watch(() => formData[props.component.name], (newValue) => {
    if (props.modelValue === undefined) {
      internalValue.value = newValue !== undefined ? newValue : (props.component as any).defaultValue
    }
  })
}

// 当组件默认值变化时（且外部未显式绑定 modelValue），同步到内部值
watch(() => (props.component as any).defaultValue, (val) => {
  if (props.modelValue === undefined) {
    internalValue.value = val
  }
})

// 监听内部值变化
watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue)
  emit('change', newValue)
  // 预览模式下，同步更新 formData
  if (props.preview && formData && props.component.name) {
    formData[props.component.name] = newValue
  }
}, { deep: true })

// 规则评估函数
const evaluateCondition = (condition: string, triggerValue: any, compareValue: any): boolean => {
  switch (condition) {
    case 'eq': // 等于
      return triggerValue == compareValue
    case 'neq': // 不等于
      return triggerValue != compareValue
    case 'contains': // 包含
      return String(triggerValue).includes(String(compareValue))
    case 'notContains': // 不包含
      return !String(triggerValue).includes(String(compareValue))
    case 'gt': // 大于
      return Number(triggerValue) > Number(compareValue)
    case 'lt': // 小于
      return Number(triggerValue) < Number(compareValue)
    case 'gte': // 大于等于
      return Number(triggerValue) >= Number(compareValue)
    case 'lte': // 小于等于
      return Number(triggerValue) <= Number(compareValue)
    case 'empty': // 为空
      return !triggerValue || triggerValue === '' || (Array.isArray(triggerValue) && triggerValue.length === 0)
    case 'notEmpty': // 不为空
      return !!triggerValue && triggerValue !== '' && (!Array.isArray(triggerValue) || triggerValue.length > 0)
    default:
      return false
  }
}

// 评估所有规则
const evaluateRules = () => {
  // 获取 formConfig 的值（可能是 computed ref）
  const config = formConfig && typeof formConfig === 'object' && 'value' in formConfig ? formConfig.value : formConfig

  if (!props.preview) {
    return
  }

  if (!config) {
    return
  }

  if (!config.displayRules) {
    return
  }

  if (!props.component.name) {
    return
  }

  const displayRules = config.displayRules as DisplayRule[]

  // 找到针对当前组件的规则
  const relevantRules = displayRules.filter(rule => rule.targetField === props.component.name)

  if (relevantRules.length === 0) {
    return
  }

  // 评估每个规则
  let ruleResults: boolean[] = []
  let logicOperators: string[] = []

  for (let i = 0; i < relevantRules.length; i++) {
    const rule = relevantRules[i]

    // 获取触发字段的值
    const triggerValue = formData[rule.triggerField]

    // 获取比较值
    let compareValue = rule.value
    if (rule.valueType === 'field') {
      compareValue = formData[rule.value]
    }

    // 评估条件
    const conditionMet = evaluateCondition(rule.condition, triggerValue, compareValue)

    ruleResults.push(conditionMet)

    // 记录逻辑运算符
    if (i < relevantRules.length - 1 && rule.logic) {
      logicOperators.push(rule.logic)
    }
  }

  // 计算最终结果（考虑 AND/OR 逻辑）
  let finalResult = ruleResults[0]
  for (let i = 0; i < logicOperators.length; i++) {
    if (logicOperators[i] === 'and') {
      finalResult = finalResult && ruleResults[i + 1]
    } else if (logicOperators[i] === 'or') {
      finalResult = finalResult || ruleResults[i + 1]
    }
  }

  // 重置规则状态为默认值
  ruleState.value = {
    visible: true,
    disabled: false,
    required: false,
    readonly: false
  }

  // 应用规则动作（只有当规则条件满足时才应用）
  // 注意：visible 状态不在这里处理，由 FormPreview 组件控制
  if (finalResult) {
    relevantRules.forEach(rule => {
      switch (rule.action) {
        case 'show':
          ruleState.value.visible = true
          break
        case 'hide':
          ruleState.value.visible = false
          break
        case 'enable':
          ruleState.value.disabled = false
          break
        case 'disable':
          ruleState.value.disabled = true
          break
        case 'required':
          ruleState.value.required = true
          break
        case 'notRequired':
          ruleState.value.required = false
          break
        case 'readonly':
          ruleState.value.readonly = true
          break
        case 'editable':
          ruleState.value.readonly = false
          break
      }
    })
  }
}

// 在预览模式下，监听 formData 变化以重新评估规则
if (props.preview && formData) {
  watch(formData, () => {
    evaluateRules()
  }, { deep: true, immediate: true })
}

// 初始评估规则
onMounted(() => {
  if (props.preview) {
    evaluateRules()
  }
})

// 计算属性：获取组件配置
const componentConfig = computed(() => props.component)

// 计算属性：组件是否可见（考虑规则）
const isVisible = computed(() => {
  return props.preview ? ruleState.value.visible : true
})

// 计算属性：组件是否禁用（考虑规则和props）
const isDisabled = computed(() => {
  return props.disabled || props.component.disabled || (props.preview && ruleState.value.disabled)
})

// 计算属性：组件是否只读（考虑规则和props）
const isReadonly = computed(() => {
  // console.log(`[FormComponentRenderer] props.readonly:`, props.readonly)
  // console.log(`[FormComponentRenderer] ruleState.value.readonly:`, ruleState.value.readonly)
  // console.log(`[FormComponentRenderer] props.preview:`, props.preview)

  // 如果props传递了readonly，优先使用
  if (props.readonly) {
    // console.log(`[FormComponentRenderer] 返回 true (因为 props.readonly)`)
    return true
  }
  // 否则检查预览模式下的规则状态
  const result = props.preview && ruleState.value.readonly
  // console.log(`[FormComponentRenderer] 返回:`, result)
  return result
})

// 计算属性：组件是否必填（考虑规则）
const isRequired = computed(() => {
  return props.preview ? (ruleState.value.required || props.component.required) : props.component.required
})

// 事件处理
const handleBlur = (event: Event) => {
  emit('blur', event)
}

const handleFocus = (event: Event) => {
  emit('focus', event)
}

// 文件上传相关方法
const handleFileUploadSuccess = (fileInfo: any, file: any) => {
  // FileUpload 组件会自动更新 v-model，这里可以做额外处理
}

const handleFileUploadError = (error: any, file: any) => {
  console.error('文件上传失败:', error)
}

const handleFileRemove = (file: any, index: number) => {
  // 文件移除处理
}

// 多选框变更处理
const handleCheckboxChange = (value: any, checked: boolean) => {
  const currentValue = Array.isArray(internalValue.value) ? [...internalValue.value] : []
  if (checked) {
    if (!currentValue.includes(value)) {
      currentValue.push(value)
    }
  } else {
    const index = currentValue.indexOf(value)
    if (index > -1) {
      currentValue.splice(index, 1)
    }
  }
  internalValue.value = currentValue
  emit('change', internalValue.value)
}

// 判断是否为容器组件
const isContainerType = (type: string): boolean => {
  return ['layout-container', 'tabs-container', 'grid-container'].includes(type)
}

// 判断子组件是否需要包裹 el-form-item
const shouldWrapFormItem = (child: FormComponent): boolean => {
  return props.preview && !isContainerType(child.type)
}
</script>

<template>
  <div class="form-component-renderer">
    <!-- 输入框 -->
    <template v-if="componentConfig.type === 'input'">
      <Input v-model="internalValue"
        :type="(componentConfig as InputComponent).inputType === 'password' ? 'password' : 'text'"
        :placeholder="componentConfig.placeholder" :disabled="isDisabled"
        :readonly="isReadonly || (componentConfig as InputComponent).readonly"
        :autofocus="(componentConfig as InputComponent).autofocus"
        :autocomplete="(componentConfig as InputComponent).autocomplete"
        :maxlength="(componentConfig as InputComponent).maxlength" @blur="handleBlur" @focus="handleFocus" />
    </template>

    <!-- 多行文本 -->
    <template v-else-if="componentConfig.type === 'textarea'">
      <Textarea v-model="internalValue" :placeholder="componentConfig.placeholder" :disabled="isDisabled"
        :rows="(componentConfig as any).rows || 4" :maxlength="(componentConfig as any).maxlength"
        :readonly="isReadonly || (componentConfig as any).readonly" :autofocus="(componentConfig as any).autofocus"
        @blur="handleBlur" @focus="handleFocus" />
    </template>


    <!-- 布局容器 -->
    <template v-else-if="componentConfig.type === 'layout-container'">
      <div class="layout-container" :style="getLayoutContainerStyle(componentConfig as LayoutContainerComponent)">
        <template v-for="child in (componentConfig as LayoutContainerComponent).children" :key="child.id">
          <!-- 预览模式下，普通组件需要包裹 el-form-item 显示 label -->
          <div v-if="shouldWrapFormItem(child)" class="form-item-preview">
            <Label class="form-label">{{ child.label }}</Label>
            <FormComponentRenderer :component="child" :disabled="isDisabled" :preview="preview" />
          </div>
          <!-- 非预览模式或容器组件，直接渲染 -->
          <FormComponentRenderer v-else :component="child" :disabled="disabled || componentConfig.disabled"
            :preview="preview" />
        </template>
      </div>
    </template>

    <!-- 页签容器 -->
    <template v-else-if="componentConfig.type === 'tabs-container'">
      <div :style="{
        padding: (componentConfig as TabsContainerComponent).padding || '0px',
        margin: (componentConfig as TabsContainerComponent).margin || '0px'
      }">
        <Tabs
          :model-value="(componentConfig as TabsContainerComponent).activeTab || (componentConfig as TabsContainerComponent).tabs[0]?.name"
          class="tabs-container">
          <TabsList>
            <TabsTrigger v-for="tab in (componentConfig as TabsContainerComponent).tabs" :key="tab.name"
              :value="tab.name">
              {{ tab.label }}
            </TabsTrigger>
          </TabsList>
          <TabsContent v-for="tab in (componentConfig as TabsContainerComponent).tabs" :key="tab.name"
            :value="tab.name">
            <div class="tab-content">
              <template v-for="child in tab.children" :key="child.id">
                <!-- 预览模式下，普通组件需要包裹 label -->
                <div v-if="shouldWrapFormItem(child)" class="form-item-preview">
                  <Label class="form-label">{{ child.label }}</Label>
                  <FormComponentRenderer :component="child" :disabled="disabled || componentConfig.disabled"
                    :preview="preview" />
                </div>
                <!-- 非预览模式或容器组件，直接渲染 -->
                <FormComponentRenderer v-else :component="child" :disabled="disabled || componentConfig.disabled"
                  :preview="preview" />
              </template>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </template>

    <!-- 栅格容器 -->
    <template v-else-if="componentConfig.type === 'grid-container'">
      <div :style="{
        padding: (componentConfig as GridContainerComponent).padding || '0px',
        margin: (componentConfig as GridContainerComponent).margin || '0px'
      }">
        <div :style="getGridContainerStyle(componentConfig as GridContainerComponent)" class="grid-container">
          <div v-for="(column, index) in (componentConfig as GridContainerComponent).columns" :key="index"
            :style="getGridColumnStyle(column.span, (componentConfig as GridContainerComponent).columns.length, typeof (componentConfig as GridContainerComponent).gutter === 'number' ? (componentConfig as GridContainerComponent).gutter : (typeof (componentConfig as GridContainerComponent).gutter === 'string' ? parseFloat((componentConfig as GridContainerComponent).gutter) || 20 : 20))"
            class="grid-col-item">
            <div class="grid-column">
              <template v-for="child in column.children" :key="child.id">
                <!-- 预览模式下，普通组件需要包裹 显示 label -->
                <div v-if="shouldWrapFormItem(child)" class="form-item-preview">
                  <Label class="form-label">{{ child.label }}</Label>
                  <FormComponentRenderer :component="child" :disabled="disabled || componentConfig.disabled"
                    :preview="preview" />
                </div>
                <!-- 非预览模式或容器组件，直接渲染 -->
                <FormComponentRenderer v-else :component="child" :disabled="disabled || componentConfig.disabled"
                  :preview="preview" />
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 未知组件类型 -->
    <template v-else>
      <div class="alert-error">
        <span class="alert-icon">⚠️</span>
        <span class="alert-message">未知组件类型: {{ componentConfig.type }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.form-component-renderer {
  width: 100%;
}

.layout-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tabs-container {
  width: 100%;
}

.tab-content {
  padding: 12px 0;
  min-height: 60px;
}

.grid-container {
  width: 100%;
  box-sizing: border-box;
}

.grid-column {
  min-height: 60px;
  padding: 8px;
  /* border: 1px dashed var(--border-color, #e5e7eb); */
  border-radius: 4px;
  /* background: var(--bg-secondary, #f9fafb); */
}
</style>