<script setup lang="ts">
import { StorageConfigApi, StorageClientConfig, StorageConfig } from '@/common/api/infrastructure/storage/config';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod'
import { useForm } from 'vee-validate'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from '@/components/ui/select';

import { DICT_TYPE, getDictOptions } from '@/common/utils/dict';
import { Button } from '@/components/ui/button';
import { toast } from 'vue-sonner';
import { Field } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

defineOptions({ name: 'StorageConfigForm' })

const dialogVisible = ref(false); // 弹窗的是否展示
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用


const formSchema = toTypedSchema(
    z.object({
        id: z.number().optional(),
        name: z.string().min(1, "名称不能为空"),
        storage: z.number(),
        description: z.string().optional(),
        config: z.object({
            endpoint: z.string().optional(),
            bucket: z.string().optional(),
            accessKey: z.string().optional(),
            accessSecret: z.string().optional(),
            domain: z.string().min(1, "自定义域名不能为空"),
            // region: z.string().optional()
        })
    })
)


const { handleSubmit, resetForm, values } = useForm({
    validationSchema: formSchema,
    initialValues: {
        id: undefined,
        name: '',
        storage: 0,
        description: '',
        config: {
            domain: '',
        } as StorageClientConfig
    },
})

const onSubmit = handleSubmit(async (values) => {
    formLoading.value = true

    try {
        const data = values as unknown as StorageConfig
        if (formType.value === 'create') {

            toast.promise(
                await StorageConfigApi.createStorageConfig(data),
                {
                    loading: '创建文件配置中...',
                    success: () => '创建 1 条文件配置数据成功!',
                    error: (err: any) => `创建失败: ${err.message || '未知错误'}`,
                }
            )

        } else {
            toast.promise(
                await StorageConfigApi.updateStorageConfig(data),
                {
                    loading: '更新文件配置数据中...',
                    success: () => '更新 1 条文件配置数据成功!',
                    error: (err: any) => `修改失败: ${err.message || '未知错误'}`,
                }
            )
        }

        dialogVisible.value = false

    } finally {
        formLoading.value = false
    }

})

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
    dialogVisible.value = true

    formType.value = type

    // 修改时，设置数据
    if (id) {
        formLoading.value = true
        try {
            const data = await StorageConfigApi.getStorageConfig(id)
            // 设置表单数据
            resetForm({ values: data })

        } finally {
            formLoading.value = false
        }
    }


}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗




</script>

<template>
    <Dialog :open="dialogVisible" @update:open="(val) => dialogVisible = val">

        <DialogContent style="width: 640px; max-width: 640px;" class="rounded-[20px]">

            <DialogHeader>
                <DialogTitle>{{ formType === 'create' ? '新增文件配置' : '修改文件配置' }}</DialogTitle>
                <DialogDescription>
                    <!-- {{ formType === 'create' ? '请填写字典类型信息' : '请修改字典类型信息' }} -->
                </DialogDescription>
            </DialogHeader>

            <form id="form-vee-demo" @submit.prevent="onSubmit" class="px-12 no-scrollbar overflow-y-auto">

                <div class="grid grid-cols-2 gap-4 ">

                    <div class="pb-6">
                        <FormField v-slot="{ componentField }" name="name">
                            <FormItem class="">
                                <FormLabel class="w-[100px]">配置名称</FormLabel>
                                <FormControl>
                                    <Input v-bind="componentField" placeholder="请输入配置名称" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                    <div class="pb-6">
                        <FormField v-slot="{ componentField }" name="storage">
                            <FormItem class="">
                                <FormLabel for="storage" class="w-[100px]">存储器</FormLabel>
                                <FormControl>
                                    <Select id="storage" v-bind="componentField">
                                        <SelectTrigger class="w-full">
                                            <SelectValue placeholder="请选择存储器" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem v-for="dict in getDictOptions(DICT_TYPE.STORAGE_CONFIG)"
                                                :key="dict.value" :value="parseInt(dict.value)">
                                                {{ dict.name }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>
                </div>


                <div class="pb-6">
                    <FormField v-slot="{ componentField }" name="description">
                        <FormItem class="">
                            <FormLabel class="w-[100px]">备注</FormLabel>
                            <FormControl>
                                <Textarea placeholder="请输入备注." v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div class="pb-6" v-if="values.storage === 10">
                    <FormField v-slot="{ componentField }" name="config.domain">
                        <FormItem class="">

                            <FormLabel for="domain" class="w-[100px]">
                                自定义域
                            </FormLabel>
                            <FormControl>
                                <Input class="" id="domain" type="text" placeholder="请输入自定义域" v-bind="componentField" />
                            </FormControl>
                            <FormMessage style="font-size: 0.65rem;" class="pl-24" />
                        </FormItem>
                    </FormField>
                </div>

                <div class="grid grid-cols-2 gap-4 ">

                    <div class="pb-6" v-if="values.storage === 10">
                        <FormField v-slot="{ componentField }" name="config.bucket">
                            <FormItem class="">
                                <FormLabel for="bucket" class="w-[100px]">
                                    存储 bucket
                                </FormLabel>
                                <FormControl>
                                    <Input class="" id="bucket" type="text" placeholder="请输入bucket"
                                        v-bind="componentField" />
                                </FormControl>
                                <FormMessage style="font-size: 0.65rem;" class="pl-24" />
                            </FormItem>
                        </FormField>
                    </div>

                    <div class="pb-6" v-if="values.storage === 10">
                        <FormField v-slot="{ componentField }" name="config.endpoint">
                            <FormItem class="">
                                <FormLabel for="endpoint" class="w-[100px]">
                                    节点地址
                                </FormLabel>
                                <FormControl>
                                    <Input class="" id="endpoint" type="text" placeholder="请输入节点地址"
                                        v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                </div>

                <div class="pb-6" v-if="values.storage === 10">
                    <FormField v-slot="{ componentField }" name="config.accessKey">
                        <FormItem class="">
                            <FormLabel for="accessKey" class="w-[100px]">
                                accessKey
                            </FormLabel>
                            <FormControl>
                                <Input class="" id="accessKey" type="text" placeholder="请输入accessKey"
                                    autocomplete="username" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div class="pb-6" v-if="values.storage === 10">
                    <FormField v-slot="{ componentField }" name="config.accessSecret">
                        <FormItem class="">
                            <FormLabel for="accessSecret" class="w-[100px]">
                                accessSecret
                            </FormLabel>
                            <FormControl>
                                <Input type="password" id="accessSecret" placeholder="请输入accessSecret"
                                    autocomplete="current-password" v-bind="componentField" />
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
</template>


<style lang="scss" scoped></style>