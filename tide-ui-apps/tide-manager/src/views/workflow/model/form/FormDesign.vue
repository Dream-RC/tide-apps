<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Icon } from '@/components/chronos-ui/Icon'
import { DICT_TYPE, getIntDictOptions } from '@/common/utils/dict'
import { WorkflowFormType } from '@/common/utils/constants'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormVO } from '@/common/api/workflow/form'
import { toast } from 'vue-sonner'


defineOptions({
    name: 'FormDesign',
})

const props = defineProps({
    formList: {
        type: Array as PropType<FormVO[]>,
        required: true
    }
})

// 创建本地数据副本
const modelData = defineModel<any>()

// Zod 校验规则
const schema = toTypedSchema(
    z.object({
        formType: z.number({ invalid_type_error: '流程类型必须是数字' }),
        formId: z.string().min(1, '请选择表单'),
    })
)

// 初始化 useForm，使用父组件传递的数据
const { values, validate } = useForm({
    validationSchema: schema,
    initialValues: modelData.value
})


// 暴露给父组件
defineExpose({
    // 暴露 values 让父组件可以获取表单数据
    values,
    // 暴露 validate 方法，校验失败时抛出异常
    validate: async () => {
        const result = await validate()
        if (!result.valid) {
            throw toast.warning('表单校验失败')
        }
        // 校验通过后同步数据到父组件
        modelData.value = {
            ...modelData.value,
            ...values
        }
        return result
    },
})

</script>

<template>
    <form class="" ref="formRef">
        <div class="info-box">

            <div class="pb-6">

                <FormField v-slot="{ componentField }" name="formType" type="radio">
                    <FormItem>
                        <FormLabel>流程类型</FormLabel>
                        <FormControl>
                            <RadioGroup class="flex gap-5" v-bind="componentField">
                                <div v-for="dict in getIntDictOptions(DICT_TYPE.Flow_FORM_TYPE)" :key="dict.value"
                                    class="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-xs shadow-black/[.04] has-data-[state=checked]:border-ring">
                                    <RadioGroupItem :value="dict.value" class="order-1 after:absolute after:inset-0" />
                                    <div class="flex grow items-center justify-center ">
                                        <div class="flex flex-col items-center gap-3 ">
                                            <Icon v-if="dict.value === 1" icon="BPMNScriptT" :size="38" />
                                            <Icon v-if="dict.value === 2" icon="yewubiaodan" :size="38" />
                                            <p class="text-xs text-muted-foreground">
                                                {{ dict.name }}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>

            </div>

            <div class="pb-6" v-if="values.formType === WorkflowFormType.NORMAL">
                <FormField name="formId" v-slot="{ componentField }">
                    <FormItem>
                        <FormLabel>流程表单</FormLabel>
                        <FormControl>
                            <Select v-bind="componentField" :value="componentField">
                                <SelectTrigger class="w-full">
                                    <SelectValue placeholder="请选择流程分类" />
                                </SelectTrigger>
                                <SelectContent>
                                    <template v-for="item in props.formList" :key="item.id">
                                        <SelectItem :value="item.id">{{ item.name }}</SelectItem>
                                    </template>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <span class="text-xs text-muted-foreground">
                            选择已创建的业务表单作为流程的数据载体
                        </span>
                        <FormMessage />
                    </FormItem>
                </FormField>
            </div>
            <div class="pb-6" v-if="values.formType === WorkflowFormType.CUSTOM">
                <FormField v-slot="{ componentField }" name="formCustomCreatePath">
                    <FormItem>
                        <FormLabel>表单标识</FormLabel>
                        <FormControl>
                            <Input v-bind="componentField" placeholder="请输入表单提交路由" />
                        </FormControl>
                        <span class="text-xs text-muted-foreground">
                            用于标识系统内置的表单类型，如：leave_form、purchase_form
                        </span>
                        <FormMessage />
                    </FormItem>
                </FormField>
            </div>

        </div>
    </form>


</template>

<style scoped>
.info-box {
    width: 580px;
    margin: 30px auto;
}
</style>