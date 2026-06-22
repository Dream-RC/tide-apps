<script lang="ts" setup>
import { PropType, onMounted } from 'vue'
import { Input } from '@/components/ui/input'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Icon } from '@/components/chronos-ui/Icon'
import { DICT_TYPE, getIntDictOptions } from '@/common/utils/dict'
import { Textarea } from '@/components/ui/textarea'
import { CategoryVO } from '@/common/api/workflow/category'
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'vue-sonner'

// 使用 defineModel 定义双向绑定
const modelData = defineModel<any>({ required: true })

const props = defineProps({
    categoryList: {
        type: Array as PropType<CategoryVO[]>,
        required: true
    },

})

// Zod 校验规则
const schema = toTypedSchema(
    z.object({
        name: z.string().min(1, '流程名称不能为空'),
        key: z.string()
            .min(1, '流程标识不能为空')
            .regex(
                /^[a-zA-Z_][\-_.0-9_a-zA-Z$]*$/,
                '只能包含字母、数字、下划线、连字符和点号，且必须以字母或下划线开头'
            ),
        category: z.string().min(1, '流程分类不能为空'),
        type: z.number({ invalid_type_error: '流程类型必须是数字' }),
        description: z.string().optional(),
        // visible: z.boolean({ required_error: '是否可见不能为空' }),
    })
)

// 初始化 useForm，使用 defineModel 的数据
const { values, validate } = useForm({
    validationSchema: schema,
    initialValues: modelData.value
})

// 组件挂载时同步父组件数据到表单
onMounted(() => {

})




// 暴露给父组件
defineExpose({
    // 暴露 values 让父组件可以获取表单数据
    values,
    // 暴露 validate 方法，校验失败时抛出异常
    validate: async () => {
        const result = await validate()
        if (!result.valid) {
            throw toast.warning('基本信息校验失败')
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
    <form ref="formRef" class="">
        <div class="info-box">

            <div class="pb-6">
                <FormField name="name" v-slot="{ componentField }">
                    <FormItem>
                        <FormLabel>流程名称</FormLabel>
                        <FormControl>
                            <Input v-bind="componentField" placeholder="请输入流程名称" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="pb-6">
                    <FormField name="key" v-slot="{ componentField }">
                        <FormItem>
                            <FormLabel>流程标识</FormLabel>
                            <FormControl>
                                <Input v-bind="componentField" placeholder="请输入流程标识，以字母或下划线开头" />
                            </FormControl>
                            <span class="text-xs text-muted-foreground">
                                流程的唯一标识符，如：leave_approval...
                            </span>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div class="pb-6">
                    <FormField name="category" v-slot="{ componentField }">
                        <FormItem>
                            <FormLabel>流程分类</FormLabel>
                            <FormControl>
                                <Select v-bind="componentField" :value="componentField">
                                    <SelectTrigger class="w-full">
                                        <SelectValue placeholder="请选择流程分类" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <template v-for="item in props.categoryList" :key="item.code">
                                            <SelectItem :value="item.code">{{ item.name }}</SelectItem>
                                        </template>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

            </div>



            <div class="pb-6">

                <FormField v-slot="{ componentField }" name="type" type="radio">
                    <FormItem>
                        <FormLabel>流程类型</FormLabel>
                        <FormControl>
                            <RadioGroup class="flex gap-5" v-bind="componentField">
                                <div v-for="dict in getIntDictOptions(DICT_TYPE.Flow_MODEL_TYPE)" :key="dict.value"
                                    class="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-xs shadow-black/[.04] has-data-[state=checked]:border-ring">
                                    <RadioGroupItem :value="dict.value" class="order-1 after:absolute after:inset-0" />
                                    <div class="flex grow items-center justify-center">
                                        <div class="flex flex-col items-center gap-3">
                                            <Icon v-if="dict.value === 1" icon="xiangmuguanli-mianxing" :size="38" />
                                            <Icon v-if="dict.value === 2" icon="mianshiguanicon_dingding" :size="38" />
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

            <div class="pb-6">
                <FormField name="description" v-slot="{ componentField }">
                    <FormItem>
                        <FormLabel>流程描述</FormLabel>
                        <FormControl>
                            <Textarea v-bind="componentField" placeholder="请输入流程描述" />
                        </FormControl>
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