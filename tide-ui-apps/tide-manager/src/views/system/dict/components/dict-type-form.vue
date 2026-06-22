<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner'
import 'vue-sonner/style.css'

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'


import { toTypedSchema } from '@vee-validate/zod';
import { Form as VeeForm, useForm } from 'vee-validate';
import * as z from 'zod'
import { DictTypeApi, DictTypeVo } from '@/common/api/system/dict/dictType';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DICT_TYPE, getIntDictOptions } from '@/common/utils/dict';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';


defineOptions({ name: 'DictTypeForm' })

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const dialogVisible = ref(false) // 弹窗的是否展示
const formType = ref('') // 表单类型：create - 新增；update - 修改

const formSchema = toTypedSchema(
    z.object({
        id: z.string().optional(),
        name: z.string().min(1, "名称不能为空"),
        type: z.string().min(1, "类型不能为空"),
        status: z.number().default(0),
        description: z.string().optional(),
    })
)

const { handleSubmit, resetForm, values } = useForm({
    validationSchema: formSchema,
    initialValues: {
        id: undefined,
        name: '',
        type: '',
        status: 0,
        description: '',
    },
})


// 打开弹窗 
const open = async (type: string, id?: string) => {

    dialogVisible.value = true
    formType.value = type
    console.log(formType)

    // 修改时，设置数据
    if (id) {
        formLoading.value = true
        try {
            const data = await DictTypeApi.getDictType(id)
            // 设置表单数据
            resetForm({ values: data })
        } catch (error) {
            console.error('获取菜单详情失败:', error)
        } finally {
            formLoading.value = false

        }
    }

}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const onSubmit = async () => {
    formLoading.value = true

    try {

        if (formType.value === 'create') {
            await DictTypeApi.createDictType(values as DictTypeVo)
            //   // message.success(t('common.createSuccess'))
        } else {
            await DictTypeApi.updateDictType(values as DictTypeVo)
            //   // message.success(t('common.updateSuccess'))
        }
        dialogVisible.value = false
        emit('success')

    } finally {
        formLoading.value = false
    }
}

</script>

<template>
    <Dialog :open="dialogVisible" @update:open="(val) => dialogVisible = val">
        <DialogContent>
            <!-- style="width: 34%; max-width: 50%;" class="rounded-l-[20px] " -->
            <DialogHeader>
                <DialogTitle>{{ formType === 'create' ? '新增字典' : '修改字典' }}</DialogTitle>
                <DialogDescription>
                    <!-- {{ formType === 'create' ? '请填写字典类型信息' : '请修改字典类型信息' }} -->
                </DialogDescription>
            </DialogHeader>

            <form id="form-vee-demo" @submit.prevent="onSubmit" class="px-12 no-scrollbar overflow-y-auto">
                <div class="pb-6">
                    <FormField v-slot="{ componentField }" name="name">
                        <FormItem class="">
                            <FormLabel>字典名称</FormLabel>
                            <FormControl>
                                <Input placeholder="请输入字典名称" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div class="pb-6">
                    <FormField v-slot="{ componentField }" name="type">
                        <FormItem class="">
                            <FormLabel>字典类型</FormLabel>
                            <FormControl>
                                <Input :disabled="formType === 'update'" placeholder="请输入字典类型"
                                    v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>


                <div class="pb-6">
                    <FormField v-slot="{ componentField }" name="status" type="radio">
                        <FormItem class="">
                            <FormLabel>菜单状态</FormLabel>
                            <FormControl>
                                <RadioGroup v-bind="componentField" class="flex items-center  space-x-4">
                                    <template v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                                        :key="dict.value">
                                        <div class="flex items-center space-x-2">
                                            <RadioGroupItem :value="dict.value" />
                                            <Label for="r1">{{ dict.name }}</Label>
                                        </div>
                                    </template>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div class="pb-6">
                    <FormField v-slot="{ componentField }" name="description">
                        <FormItem class="">
                            <FormLabel>备注</FormLabel>
                            <FormControl>
                                <Textarea placeholder="请输入备注." v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>


            </form>

            <DialogFooter class="px-12">
                <Field class="">
                    <div class="grid grid-cols-2 gap-4">

                        <Button type="button" variant="outline" @click="dialogVisible = false">
                            取消
                        </Button>

                        <Button type="submit" form="form-vee-demo">
                            确定
                        </Button>
                    </div>
                </Field>

            </DialogFooter>

        </DialogContent>
    </Dialog>

    <Toaster theme="dark" :closeButton="true" closeButtonPosition="top-right" />

</template>

<style scoped>
/* 可以添加自定义样式 */
</style>