<script setup lang="ts">
import { ref, computed, reactive, provide } from 'vue'
import FormComponentRenderer from '@/components/chronos-ui/form-designer/FormComponentRenderer.vue'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useFormDesignerStore } from '@/store/modules/formDesigner'
import { Label } from '@/components/ui/label'
defineOptions({ name: 'FormPreview' })

const formDesignerStore = useFormDesignerStore()
const dialogVisible = ref(false) // 弹窗的是否展示

// 定义props
interface Props {
    formConfig?: any
    initialData?: Record<string, any> // 用于数据回显的初始数据
    fieldPermissions?: Record<string, string> // 字段权限配置：{ fieldName: 'hidden' | 'readonly' | 'editable' }
    readonly?: boolean // 整个表单是否只读（优先级低于fieldPermissions）
}

const props = withDefaults(defineProps<Props>(), {
    config: undefined,
    initialData: () => ({}),
    fieldPermissions: () => ({}),
    readonly: false
})


// 当前表单配置 - 优先使用props，否则使用store
const currentFormConfig = computed(() => {
    if (props.formConfig) {
        return props.formConfig
    }
    return formDesignerStore.currentForm
})

// 表单数据 - 从 initialData 初始化
const formData = reactive<Record<string, any>>({})

// 初始化表单数据
const initFormData = () => {
    // 清空现有数据
    Object.keys(formData).forEach(key => delete formData[key])

    // 从 initialData 初始化
    Object.assign(formData, props.initialData)

    // 如果没有初始数据，从组件默认值初始化
    if (currentFormConfig.value.components) {
        currentFormConfig.value.components.forEach((component: any) => {
            if (component.name && formData[component.name] === undefined) {
                formData[component.name] = component.defaultValue
            }
        })
    }
}

// 提供 formData 给子组件
provide('formData', formData)
provide('formConfig', currentFormConfig)



/** 打开弹窗 */
const openFormPreview = async (type: string, id?: string) => {
    // 初始化表单数据
    initFormData()
    dialogVisible.value = true
}

// 判断字段是否隐藏
const isFieldHidden = (fieldName: string): boolean => {
    if (!fieldName) return false
    return props.fieldPermissions[fieldName] === 'hidden'
}

// 判断字段是否只读
const isFieldReadonly = (fieldName: string): boolean => {
    if (!fieldName) return false
    if (props.readonly) return true
    return props.fieldPermissions[fieldName] === 'readonly'
}

defineExpose({ openFormPreview }) // 提供 open 方法，用于打开弹窗



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


</script>

<template>

    <Sheet :open="dialogVisible" @update:open="(val) => dialogVisible = val">
        <SheetContent style="width: 50%; max-width: 50%; height: 100vh; overflow-y: auto;" class="rounded-l-[20px] p-[50px]">
            <div :class="`label-position-${currentFormConfig.labelPosition || 'right'}`"
                :style="{ '--label-width': currentFormConfig.labelWidth || '100px' }">
                <div class="flex flex-wrap">
                    <template v-for="component in currentFormConfig.components" :key="component.id">
                        <!-- 布局容器：占据整行，不包裹在表单项目中 -->
                        <div v-if="['layout-container', 'tabs-container', 'grid-container'].includes(component.type)"
                            v-show="shouldShowComponent(component)" :style="{ width: '100%' }">
                            <FormComponentRenderer :component="component" :preview="true" />
                        </div>

                        <!-- 普通表单组件：使用栅格系统，包裹在表单项目中 -->
                        <div v-else v-show="shouldShowComponent(component) && !isFieldHidden(component.name)"
                            class="form-item-wrapper"
                            :style="{ width: `calc(${(component.span || 24) / 24 * 100}% - ${(component.span || 24) / 24 * 1}px)` }">
                            <div class="form-item-preview">
                                <Label class="form-label" :class="{ 'required': component.required }">
                                    {{ component.label }}
                                </Label>
                                <FormComponentRenderer :component="component" v-model="formData[component.name]"
                                    :preview="true" :readonly="isFieldReadonly(component.name)" />
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </SheetContent>

    </Sheet>


</template>

<style scoped lang="scss">
.form-item-wrapper {
    position: relative;
    box-sizing: border-box;
}

.form-item-preview {
    width: 100%;
    padding: 10px 16px 14px 10px;
    background: var(--background);
}

.form-label {
    display: block;
    margin-bottom: 14px;
}
</style>