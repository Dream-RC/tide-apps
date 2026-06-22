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
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DICT_TYPE, getIntDictOptions } from '@/common/utils/dict';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { CommonStatusEnum } from '@/common/utils/constants';
import { DictDataApi, DictDataVo } from '@/common/api/system/dict/dictData';
import { CategoryVO, WorkFlowCategoryApi } from '@/common/api/workflow/category';


defineOptions({ name: 'WorkflowCategoryForm' })


const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const dialogVisible = ref(false) // 弹窗的是否展示
const formType = ref('') // 表单类型：create - 新增；update - 修改

const formSchema = toTypedSchema(
    z.object({
        id: z.string().optional(),
        name: z.string().min(1, "名称不能为空"),
        description: z.string().optional(),
        code: z.string().optional(),

        status: z.number().default(0),
        sort: z.number().default(0),

    })
)

const { handleSubmit, resetForm, values } = useForm({
    validationSchema: formSchema,
    initialValues: {
        id: undefined,
        name: '',
        description: '',
        code: '',
        status: CommonStatusEnum.ENABLE,
        sort: undefined,
    },
})


// 打开弹窗 
const openCategoryForm = async (type: string, id?: string) => {

    dialogVisible.value = true
    formType.value = type

    // 重置表单并设置字典类型
    resetForm({
        values: {
            id: undefined,
            name: '',
            description: '',
            code: '',
            status: CommonStatusEnum.ENABLE,
            sort: 1,


        }
    })

    // 修改时，设置数据
    if (id) {
        formLoading.value = true
        try {
            const data = await WorkFlowCategoryApi.getCategory(id)

            // 设置表单数据
            resetForm({ values: data })

            // 设置表单数据
            // resetForm({ values: data })
        } catch (error) {
            console.error('获取菜单详情失败:', error)
        } finally {
            formLoading.value = false
        }
    }

}

defineExpose({ openCategoryForm }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const onSubmit = async () => {
    formLoading.value = true

    try {

        if (formType.value === 'create') {

            toast.promise(
                await WorkFlowCategoryApi.createCategory(values as CategoryVO),
                {
                    loading: '创建分类中...',
                    success: () => '创建 1 条分类成功!',
                    error: (err: any) => `创建失败: ${err.message || '未知错误'}`,
                }
            )

        } else {
            // await DictTypeApi.updateDictType(values as DictTypeVo)
            //   // message.success(t('common.updateSuccess'))

            toast.promise(
                await WorkFlowCategoryApi.updateCategory(values as CategoryVO),
                {
                    loading: '更新分类中...',
                    success: () => '更新 1 条分类成功!',
                    error: (err: any) => `修改失败: ${err.message || '未知错误'}`,
                }
            )

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
            <DialogHeader>
                <DialogTitle>{{ formType === 'create' ? '新增分类' : '修改分类' }}</DialogTitle>
                <DialogDescription>
                    <!-- {{ formType === 'create' ? '请填写分类信息' : '请修改分类信息' }} -->
                </DialogDescription>
            </DialogHeader>

            <form id="form-vee-demo" @submit.prevent="onSubmit" class="px-12 no-scrollbar">


                <div class="pb-6">
                    <FormField v-slot="{ componentField }" name="name">
                        <FormItem class="">
                            <FormLabel>分类名称</FormLabel>
                            <FormControl>
                                <Input placeholder="请输入分类名称" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>


                <div class="pb-6">
                    <FormField v-slot="{ componentField }" name="code">
                        <FormItem class="">
                            <FormLabel>分类标志</FormLabel>
                            <FormControl>
                                <Input placeholder="请输入分类名称" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div class="pb-6">
                    <FormField v-slot="{ componentField }" name="description">
                        <FormItem class="">
                            <FormLabel>分类描述</FormLabel>
                            <FormControl>
                                <Textarea placeholder="请输入描述." v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div class="pb-6">
                    <FormField v-slot="{ componentField }" name="sort">
                        <FormItem>
                            <FormLabel>排序</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="请输入排序" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>


                <div class="">
                    <FormField v-slot="{ componentField }" name="status" type="radio">
                        <FormItem class="">
                            <FormLabel>分类状态</FormLabel>
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

<style lang="scss" scoped></style>