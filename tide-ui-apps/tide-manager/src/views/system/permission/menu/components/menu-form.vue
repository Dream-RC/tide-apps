<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner'
import 'vue-sonner/style.css'

import { ref } from 'vue'
import { MenuApi, MenuVo } from '@/common/api/system/permission/menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import {
    Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle
} from '@/components/ui/sheet';
import { toTypedSchema } from '@vee-validate/zod';
import { Form as VeeForm, useForm } from 'vee-validate';
import * as z from 'zod'
import { DICT_TYPE, getDictOptions, getIntDictOptions } from '@/common/utils/dict'
import { handleTree } from '@/common/utils/tree';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/chronos-ui/Icon';
import { TreeSelect } from '@/components/chronos-ui/select';
import { SystemMenuTypeEnum } from '@/common/types/constants';



defineOptions({ name: 'MenuForm' })

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const dialogVisible = ref(false) // 弹窗的是否展示
const formType = ref('') // 表单类型：create - 新增；update - 修改


/** 获取下拉框[上级菜单]的数据  */
const menuTree = ref<Tree[]>([]) // 树形结构

const formSchema = toTypedSchema(
    z.object({
        id: z.string().optional(),
        name: z.string().min(1, "名称不能为空"),
        permission: z.string().optional(),
        type: z.number().min(0, "请选择菜单类型"),
        sort: z.number().min(0, "排序不能小于0"),
        parentId: z.string().default("0"),
        path: z.string().optional(),
        icon: z.string().optional(),
        component: z.string().optional(),
        componentName: z.string().optional(),
        status: z.number().default(0),
        visible: z.boolean().default(true),
        keepAlive: z.boolean().default(true),
        alwaysShow: z.boolean().default(true)
    })
)

const getTree = async () => {
    menuTree.value = []
    const res = await MenuApi.getSimpleMenusList()
    let menu: Tree = { id: "0", name: '顶级菜单', children: [] }
    menu.children = handleTree(res)
    menuTree.value.push(menu)
}
// handleSubmit, isSubmitting, 
const { handleSubmit, resetForm, values } = useForm({
    validationSchema: formSchema,
    initialValues: {
        id: undefined,
        name: '',
        permission: '',
        type: 1,
        sort: 0,
        parentId: "0",
        path: '',
        icon: '',
        component: '',
        componentName: '',
        status: 0,
        visible: true,
        keepAlive: true,
        alwaysShow: true
    },
})


/** 打开弹窗 */
const open = async (type: string, id?: string) => {

    dialogVisible.value = true
    formType.value = type

    // 修改时，设置数据
    if (id) {
        formLoading.value = true
        try {
            const data = await MenuApi.getMenu(id)
            // 设置表单数据
            resetForm({ values: data })
            // resetForm({
            //     values: {
            //         id: data.id,
            //         name: data.name || '',
            //         permission: data.permission || '',
            //         type: data.type || 1,
            //         sort: data.sort || 0,
            //         parentId: data.parentId || 0,
            //         path: data.path || '',
            //         icon: data.icon || '',
            //         component: data.component || '',
            //         componentName: data.componentName || '',
            //         status: data.status || 0,
            //         visible: data.visible ?? true,
            //         keepAlive: data.keepAlive ?? true,
            //         alwaysShow: data.alwaysShow ?? true
            //     }
            // })

        } catch (error) {
            console.error('获取菜单详情失败:', error)
        } finally {
            formLoading.value = false
        }
    }

    // 获得菜单列表
    await getTree()
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

// const onSubmit = handleSubmit(async (values) => {
//     console.log("---------------");
// })
const showToast = ref(false) // 控制 Toast 显示
const toastMessage = ref('') // Toast 消息内容

/** 判断 path 是不是外部的 HTTP 等链接 */
const isExternal = (path: string) => {
    return /^(https?:|mailto:|tel:)/.test(path)
}

const onSubmit = async () => {
    // 提交请求
    formLoading.value = true
    try {

        if (
            values.type === SystemMenuTypeEnum.DIR ||
            values.type === SystemMenuTypeEnum.MENU
        ) {
            if (!isExternal(values.path)) {
                if (String(values.parentId) === "0" && values.path.charAt(0) !== '/') {
                    toast.error('路径必须以 / 开头')
                    return
                } else if (String(values.parentId) !== "0" && values.path.charAt(0) === '/') {
                    toast.error('路径不能以 / 开头')
                    return
                }
            }
        }

        if (formType.value === 'create') {
            toast.promise(
                await MenuApi.createMenu(values as MenuVo),
                {
                    loading: '创建菜单中...',
                    success: () => '创建 1 条菜单成功!',
                    error: (err: any) => `创建失败: ${err.message || '未知错误'}`,
                }
            )
            // await MenuApi.createMenu(data)
            // ElMessage.success('创建成功')
        } else {
            toast.promise(
                await MenuApi.updateMenu(values as MenuVo),
                {
                    loading: '更新菜单中...',
                    success: () => '更新 1 条菜单成功!',
                    error: (err: any) => `修改失败: ${err.message || '未知错误'}`,
                }
            )
        }


        dialogVisible.value = false
        emit('success')

    } finally {

        formLoading.value = false

        // 清空，从而触发刷新
        //   wsCache.delete(CACHE_KEY.ROLE_ROUTERS)
    }
}

</script>

<template>
    <Sheet :open="dialogVisible" @update:open="(val) => dialogVisible = val">
        <!-- grid flex-1 auto-rows-min gap-6 px-4 -->
        <SheetContent style="width: 34%; max-width: 50%;" class="rounded-l-[20px] ">
            <SheetHeader>
                <SheetTitle>{{ formType === 'create' ? '新增菜单' : '修改菜单' }}</SheetTitle>
            </SheetHeader>

            <form id="form-vee-demo" @submit.prevent="onSubmit" class="px-12 no-scrollbar overflow-y-auto">

                <div class="pb-6">
                    <FormField v-slot="{ field }" name="name">
                        <FormItem class="">
                            <FormLabel>菜单名称</FormLabel>
                            <FormControl>
                                <Input placeholder="请输入菜单名称" v-bind="field" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div class="grid grid-cols-2 gap-4 ">


                    <div class="pb-6">
                        <FormField v-slot="{ componentField }" name="parentId">
                            <FormItem class="">
                                <FormLabel>上级菜单</FormLabel>
                                <FormControl>
                                    <TreeSelect :menuTree="menuTree" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                    <div v-if="values.type !== 3" class="pb-6">
                        <FormField v-slot="{ componentField }" name="icon">
                            <FormItem class="">
                                <FormLabel>菜单图标</FormLabel>
                                <FormControl>
                                    <Input placeholder="例：icon" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                </div>




                <div class="pb-6">

                    <FormField v-slot="{ componentField }" name="type" type="radio">
                        <FormItem>
                            <FormLabel>菜单类型</FormLabel>
                            <FormControl>
                                <RadioGroup class="flex gap-2" v-bind="componentField">
                                    <div v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_MENU_TYPE)" :key="dict.value"
                                        class="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-xs shadow-black/[.04] has-data-[state=checked]:border-ring">
                                        <RadioGroupItem :value="dict.value"
                                            class="order-1 after:absolute after:inset-0" />
                                        <div class="flex grow items-center justify-center">
                                            <div class="flex flex-col items-center gap-3">
                                                <Icon v-if="dict.value === 1" icon="xiangmuguanli-mianxing" />
                                                <Icon v-if="dict.value === 2" icon="caidan1" />
                                                <Icon v-if="dict.value === 3" icon="24gf-play" />
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




                <div v-if="values.type !== 3" class="pb-6">
                    <FormField v-slot="{ componentField }" name="path">
                        <FormItem class="">
                            <FormLabel>路由地址</FormLabel>
                            <FormControl>
                                <Input placeholder="请输入路由地址" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>


                <div v-if="values.type == 2" class="pb-6">
                    <FormField v-slot="{ componentField }" name="componentName">
                        <FormItem class="">
                            <FormLabel>组件名称</FormLabel>
                            <FormControl>
                                <Input placeholder="例：SystemUser" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div v-if="values.type == 2" class="pb-6">
                    <FormField v-slot="{ componentField }" name="component">
                        <FormItem class="">
                            <FormLabel>组件地址</FormLabel>
                            <FormControl>
                                <Input placeholder="例：system/user/index" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div v-if="values.type !== 1" class="pb-6">
                    <FormField v-slot="{ componentField }" name="permission">
                        <FormItem class="">
                            <FormLabel>权限标识</FormLabel>
                            <FormControl>
                                <Input placeholder="例：system:user:list" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div class="grid grid-cols-2 gap-4 pb-6">

                    <div class="">
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


                </div>


            </form>
            <!-- class="p-0 pb-6" -->
            <SheetFooter class="px-12">
                <!-- flex justify-end gap-4 -->
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

            </SheetFooter>

        </SheetContent>
    </Sheet>

    <Toaster theme="dark" :closeButton="true" closeButtonPosition="top-right" />

</template>

<style scoped>
/* 可以添加自定义样式 */
</style>