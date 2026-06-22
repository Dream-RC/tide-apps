<template>
  <div class="form-preview">
    <form :class="`label-position-${currentFormConfig.labelPosition || 'right'}`"
      :style="{ '--label-width': currentFormConfig.labelWidth || '100px' }">
      <div class="flex flex-wrap gap-5">
        <template v-for="component in currentFormConfig.components" :key="component.id">
          <!-- 布局容器：占据整行，不包裹在表单项目中 -->
          <div v-if="['layout-container', 'tabs-container', 'grid-container'].includes(component.type)"
            v-show="shouldShowComponent(component)" :style="{ width: '100%' }">
            <FormComponentRenderer :component="component" :preview="true" />
          </div>

          <!-- 普通表单组件：使用栅格系统，包裹在表单项目中 -->
          <div v-else v-show="shouldShowComponent(component) && !isFieldHidden(component.name)"
            class="form-item-wrapper" :style="{ width: `calc(${(component.span || 24) / 24 * 100}% - ${(component.span || 24) / 24 * 115}px)` }">
            <div class="form-item-preview">
              <Label class="form-label" :class="{ 'required': component.required }">
                {{ component.label }}
              </Label>
              <FormComponentRenderer :component="component" v-model="formData[component.name]" :preview="true"
                :readonly="isFieldReadonly(component.name)" />
            </div>
          </div>
        </template>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, provide } from 'vue'
import { useFormDesignerStore } from '@/store/modules/formDesigner'
import FormComponentRenderer from './FormComponentRenderer.vue'
import ContainerRenderer from './ContainerRenderer.vue'
import { Label } from '@/components/ui/label'

// 定义props
interface Props {
  formConfig?: any
  initialData?: Record<string, any> // 用于数据回显的初始数据
  fieldPermissions?: Record<string, string> // 字段权限配置：{ fieldName: 'hidden' | 'readonly' | 'editable' }
  readonly?: boolean // 整个表单是否只读（优先级低于fieldPermissions）
}

const props = withDefaults(defineProps<Props>(), {
  formConfig: undefined,
  initialData: () => ({}),
  fieldPermissions: () => ({}),
  readonly: false
})

// 监听props变化，打印调试信息
watch(() => props.fieldPermissions, (newVal) => {
  console.log('[FormPreview] fieldPermissions 变化:', newVal)
}, { immediate: true, deep: true })

watch(() => props.readonly, (newVal) => {
  console.log('[FormPreview] readonly 变化:', newVal)
}, { immediate: true })

const formDesignerStore = useFormDesignerStore()

// 表单引用
const formRef = ref<HTMLFormElement | null>(null)

// 当前表单配置 - 优先使用props，否则使用store
const currentFormConfig = computed(() => {
  if (props.formConfig) {
    return props.formConfig
  }
  return formDesignerStore.currentForm
})

// 表单数据
const formData = reactive<Record<string, any>>({})

// 动态生成表单验证规则
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {}
  const components = currentFormConfig.value.components || []

  components.forEach(component => {
    // 容器组件不需要验证规则
    if (['layout-container', 'tabs-container', 'grid-container'].includes(component.type)) {
      return
    }
    if (!component.name) return

    const fieldRules: any[] = []

    // 必填验证
    if (component.required) {
      fieldRules.push({
        required: true,
        message: `${component.label || component.name}不能为空`,
        trigger: ['blur', 'change']
      })
    }

    // 根据组件类型添加特定验证
    if (component.type === 'input' || component.type === 'textarea') {
      // 最小长度验证
      if (component.minLength) {
        fieldRules.push({
          min: component.minLength,
          message: `${component.label || component.name}长度不能少于${component.minLength}个字符`,
          trigger: 'blur'
        })
      }

      // 最大长度验证
      if (component.maxLength) {
        fieldRules.push({
          max: component.maxLength,
          message: `${component.label || component.name}长度不能超过${component.maxLength}个字符`,
          trigger: 'blur'
        })
      }

      // 正则验证
      if (component.pattern) {
        fieldRules.push({
          pattern: new RegExp(component.pattern),
          message: component.patternMessage || `${component.label || component.name}格式不正确`,
          trigger: 'blur'
        })
      }
    }

    // 数字类型验证
    if (component.type === 'number') {
      // 最小值验证
      if (component.min !== undefined && component.min !== null) {
        fieldRules.push({
          type: 'number',
          min: component.min,
          message: `${component.label || component.name}不能小于${component.min}`,
          trigger: 'blur'
        })
      }

      // 最大值验证
      if (component.max !== undefined && component.max !== null) {
        fieldRules.push({
          type: 'number',
          max: component.max,
          message: `${component.label || component.name}不能大于${component.max}`,
          trigger: 'blur'
        })
      }
    }

    // 邮箱验证
    if (component.type === 'input' && component.inputType === 'email') {
      fieldRules.push({
        type: 'email',
        message: '请输入正确的邮箱地址',
        trigger: 'blur'
      })
    }

    // URL验证
    if (component.type === 'input' && component.inputType === 'url') {
      fieldRules.push({
        type: 'url',
        message: '请输入正确的URL地址',
        trigger: 'blur'
      })
    }

    if (fieldRules.length > 0) {
      rules[component.name] = fieldRules
    }
  })

  return rules
})

// 递归收集所有表单组件（包括容器内的子组件）
const collectFormComponents = (components: any[]): any[] => {
  const allComponents: any[] = []

  const traverse = (comps: any[]) => {
    comps.forEach(component => {
      // 如果是容器组件，递归处理其子组件
      if (component.type === 'layout-container' && component.children) {
        traverse(component.children)
      } else if (component.type === 'tabs-container' && component.tabs) {
        component.tabs.forEach((tab: any) => {
          if (tab.children) {
            traverse(tab.children)
          }
        })
      } else if (component.type === 'grid-container' && component.columns) {
        component.columns.forEach((column: any) => {
          if (column.children) {
            traverse(column.children)
          }
        })
      } else {
        // 普通表单组件
        allComponents.push(component)
      }
    })
  }

  traverse(components)
  return allComponents
}

// 初始化表单数据
const initFormData = () => {
  // 先清空现有数据
  Object.keys(formData).forEach(key => {
    delete formData[key]
  })

  const components = currentFormConfig.value.components || []
  // 收集所有表单组件（包括容器内的子组件）
  const allComponents = collectFormComponents(components)

  allComponents.forEach(component => {
    if (component.name) {
      // 优先使用传入的初始数据，否则使用默认值
      if (props.initialData && props.initialData[component.name] !== undefined) {
        formData[component.name] = props.initialData[component.name]
      } else {
        formData[component.name] = (component as any).defaultValue || ''
      }
    }
  })
}

// 监听组件变化和初始数据变化，重新初始化表单数据
watch([currentFormConfig, () => props.initialData], initFormData, { immediate: true, deep: true })

// 提供 formData 和 formConfig 给子组件使用（预览模式下容器内的子组件需要访问）
// 注意：formData 是 reactive，formConfig 需要提供 computed 的值
provide('formData', formData)
provide('formConfig', currentFormConfig)

// 规则评估函数（与 FormComponentRenderer 中的逻辑相同）
const evaluateCondition = (condition: string, triggerValue: any, compareValue: any): boolean => {
  switch (condition) {
    case 'eq': return triggerValue == compareValue
    case 'neq': return triggerValue != compareValue
    case 'contains': return String(triggerValue).includes(String(compareValue))
    case 'notContains': return !String(triggerValue).includes(String(compareValue))
    case 'gt': return Number(triggerValue) > Number(compareValue)
    case 'lt': return Number(triggerValue) < Number(compareValue)
    case 'gte': return Number(triggerValue) >= Number(compareValue)
    case 'lte': return Number(triggerValue) <= Number(compareValue)
    case 'empty': return !triggerValue || triggerValue === '' || (Array.isArray(triggerValue) && triggerValue.length === 0)
    case 'notEmpty': return !!triggerValue && triggerValue !== '' && (!Array.isArray(triggerValue) || triggerValue.length > 0)
    default: return false
  }
}

// 判断组件是否应该显示
const shouldShowComponent = (component: any): boolean => {
  if (!component.name || !currentFormConfig.value.displayRules) {
    return true
  }

  const displayRules = currentFormConfig.value.displayRules
  const relevantRules = displayRules.filter((rule: any) => rule.targetField === component.name)

  if (relevantRules.length === 0) {
    return true
  }

  // 评估规则
  let visible = true
  let ruleResults: boolean[] = []
  let logicOperators: string[] = []

  for (let i = 0; i < relevantRules.length; i++) {
    const rule = relevantRules[i]
    const triggerValue = formData[rule.triggerField]
    let compareValue = rule.value
    if (rule.valueType === 'field') {
      compareValue = formData[rule.value]
    }

    const conditionMet = evaluateCondition(rule.condition, triggerValue, compareValue)
    ruleResults.push(conditionMet)

    if (i < relevantRules.length - 1 && rule.logic) {
      logicOperators.push(rule.logic)
    }
  }

  // 计算最终结果
  let finalResult = ruleResults[0]
  for (let i = 0; i < logicOperators.length; i++) {
    if (logicOperators[i] === 'and') {
      finalResult = finalResult && ruleResults[i + 1]
    } else if (logicOperators[i] === 'or') {
      finalResult = finalResult || ruleResults[i + 1]
    }
  }

  // 应用规则动作
  if (finalResult) {
    relevantRules.forEach((rule: any) => {
      if (rule.action === 'hide') {
        visible = false
      } else if (rule.action === 'show') {
        visible = true
      }
    })
  }

  return visible
}

// ========== 字段权限控制 ==========

/**
 * 获取字段的权限
 * @param fieldName 字段名称
 * @returns 'hidden' | 'readonly' | 'editable'
 */
const getFieldPermission = (fieldName: string): string => {
  // 如果有字段级别的权限配置，优先使用
  if (props.fieldPermissions && props.fieldPermissions[fieldName]) {
    console.log(`[FormPreview] 字段 ${fieldName} 的权限:`, props.fieldPermissions[fieldName])
    return props.fieldPermissions[fieldName]
  }

  // 如果整个表单设置为只读，则所有字段都是只读
  if (props.readonly) {
    console.log(`[FormPreview] 字段 ${fieldName} 因表单只读而设置为只读`)
    return 'readonly'
  }

  // 默认可编辑
  console.log(`[FormPreview] 字段 ${fieldName} 默认可编辑`)
  return 'editable'
}

/**
 * 判断字段是否应该隐藏
 * @param fieldName 字段名称
 * @returns boolean
 */
const isFieldHidden = (fieldName: string): boolean => {
  return getFieldPermission(fieldName) === 'hidden'
}

/**
 * 判断字段是否应该只读
 * @param fieldName 字段名称
 * @returns boolean
 */
const isFieldReadonly = (fieldName: string): boolean => {
  const permission = getFieldPermission(fieldName)
  const result = permission === 'readonly'
  console.log(`[FormPreview] isFieldReadonly(${fieldName}): permission=${permission}, result=${result}, props.readonly=${props.readonly}`)
  return result
}

// 提供字段权限方法给子组件使用
provide('getFieldPermission', getFieldPermission)
provide('isFieldReadonly', isFieldReadonly)

// 暴露获取表单数据的方法给父组件
const getFormData = () => {
  return { ...formData }
}

// 暴露表单验证方法给父组件
const validate = async (): Promise<boolean> => {
  if (!formRef.value) {
    console.warn('表单引用未初始化')
    return false
  }

  try {
    await formRef.value.validate()
    return true
  } catch (error) {
    console.error('表单验证失败:', error)
    return false
  }
}

// 重置表单验证
const resetValidation = () => {
  formRef.value?.clearValidate()
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
}

// 暴露方法给父组件
defineExpose({
  getFormData,
  validate,
  resetValidation,
  resetForm
})
</script>

<style scoped lang="scss">
.form-preview {
  padding: 20px;
  // background: var(--bg-card);
  border-radius: 4px;

  .el-form {
    max-width: none;
  }
}

// 重置预览区域最外层 el-row 的 gutter 影响
// Element Plus 的 gutter 会通过给 el-col 添加左右 padding 实现
.form-preview>.el-form>.el-row {
  margin-left: 0 !important;
  margin-right: 0 !important;

  // 重置所有直接子 el-col 的 padding（消除外层 gutter 的影响）
  >.el-col {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
}

// 确保预览区域内的栅格容器不受外层 gutter 影响
// 栅格容器现在使用 Flexbox 实现，不再依赖 el-row/el-col
.form-preview :deep(.grid-container) {
  box-sizing: border-box;
}
</style>