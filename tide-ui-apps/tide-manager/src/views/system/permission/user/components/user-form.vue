<script setup lang="ts">
import { toast } from 'vue-sonner'
import { UserApi } from '@/common/api/system/permission/user';
import type { UserVo } from '@/common/api/system/permission/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import * as z from 'zod'
import { DICT_TYPE, getIntDictOptions } from '@/common/utils/dict'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Field } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { CommonStatusEnum } from '@/common/utils/constants';

defineOptions({ name: 'UserForm' })

const formLoading = ref(false)
const dialogVisible = ref(false)
const formType = ref('')

const formSchema = toTypedSchema(
    z.object({
        id: z.string().optional(),
        username: z.string().min(1, "用户名不能为空"),
        password: z.string().min(6, "密码至少6位").optional().or(z.literal('')),
        nickname: z.string().min(1, "昵称不能为空"),
        email: z.string().email("请输入正确的邮箱").optional().or(z.literal('')),
        mobile: z.string().optional().or(z.literal('')),
        sex: z.number().default(0),
        status: z.number().default(0),
        description: z.string().optional().or(z.literal('')),
    })
)

const { handleSubmit, resetForm, values } = useForm({
    validationSchema: formSchema,
    initialValues: {
        id: undefined,
        username: '',
        password: '',
        nickname: '',
        email: '',
        mobile: '',
        sex: 0,
        status: CommonStatusEnum.ENABLE,
        description: '',
    },
})

const open = async (type: string, id?: string) => {
    dialogVisible.value = true
    formType.value = type

    if (id) {
        formLoading.value = true
        try {
            const data = await UserApi.getUser(id)
            resetForm({
                values: {
                    id: String(data.id || ''),
                    username: data.username || '',
                    password: '',
                    nickname: data.nickname || '',
                    email: data.email || '',
                    mobile: data.mobile || '',
                    sex: data.sex ?? 0,
                    status: data.status ?? 0,
                    description: data.description || '',
                }
            })
        } finally {
            formLoading.value = false
        }
    }
}

defineExpose({ open })

const emit = defineEmits(['success'])

const onSubmit = handleSubmit(async () => {
    formLoading.value = true
    try {
        if (formType.value === 'create') {
            await UserApi.createUser(values as UserVo)
            toast.success('创建用户成功')
        } else {
            await UserApi.updateUser(values as UserVo)
            toast.success('更新用户成功')
        }
        dialogVisible.value = false
        emit('success')
    } catch (err: any) {
        toast.error(err?.message || '操作失败')
    } finally {
        formLoading.value = false
    }
})
</script>

<template>
    <Dialog :open="dialogVisible" @update:open="(val: boolean) => dialogVisible = val">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{{ formType === 'create' ? '新增用户' : '修改用户' }}</DialogTitle>
            </DialogHeader>

            <form id="user-form" @submit.prevent="onSubmit" class=" no-scrollbar overflow-y-auto">
                <div class="grid grid-cols-2 gap-4 pb-6">
                    <div class="">
                        <FormField v-slot="{ field }" name="username">
                            <FormItem>
                                <FormLabel>用户名</FormLabel>
                                <FormControl>
                                    <Input placeholder="请输入用户名" v-bind="field" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                    <div class="">
                        <FormField v-slot="{ field }" name="nickname">
                            <FormItem>
                                <FormLabel>昵称</FormLabel>
                                <FormControl>
                                    <Input placeholder="请输入昵称" v-bind="field" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                </div>


                <div class="grid grid-cols-2 gap-4 pb-6">
                    <div>
                        <FormField v-slot="{ field }" name="email">
                            <FormItem>
                                <FormLabel>邮箱</FormLabel>
                                <FormControl>
                                    <Input placeholder="请输入邮箱" v-bind="field" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                    <div>
                        <FormField v-slot="{ field }" name="mobile">
                            <FormItem>
                                <FormLabel>手机号</FormLabel>
                                <FormControl>
                                    <Input placeholder="请输入手机号" v-bind="field" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>
                </div>

                <div v-if="formType === 'create'" class="pb-6">
                    <FormField v-slot="{ field }" name="password">
                        <FormItem>
                            <FormLabel>密码</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="请输入密码" v-bind="field" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div class="grid grid-cols-2 gap-4 pb-6">
                    <div>
                        <FormField v-slot="{ componentField }" name="sex" type="radio">
                            <FormItem>
                                <FormLabel>性别</FormLabel>
                                <FormControl>
                                    <RadioGroup v-bind="componentField" class="flex items-center space-x-4">
                                        <template v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
                                            :key="dict.value">
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem :value="dict.value" />
                                                <Label>{{ dict.name }}</Label>
                                            </div>
                                        </template>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                    <div>
                        <FormField v-slot="{ componentField }" name="status" type="radio">
                            <FormItem>
                                <FormLabel>状态</FormLabel>
                                <FormControl>
                                    <RadioGroup v-bind="componentField" class="flex items-center space-x-4">
                                        <template v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                                            :key="dict.value">
                                            <div class="flex items-center space-x-2">
                                                <RadioGroupItem :value="dict.value" />
                                                <Label>{{ dict.name }}</Label>
                                            </div>
                                        </template>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>
                </div>

                <div class="pb-6">
                    <FormField v-slot="{ field }" name="description">
                        <FormItem>
                            <FormLabel>备注</FormLabel>
                            <FormControl>
                                <Textarea placeholder="请输入备注" v-bind="field" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

            </form>

            <DialogFooter class="px-12">
                <Field>
                    <div class="grid grid-cols-2 gap-4">
                        <Button type="button" variant="outline" @click="dialogVisible = false">
                            取消
                        </Button>
                        <Button type="submit" form="user-form" :disabled="formLoading">
                            确定
                        </Button>
                    </div>
                </Field>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>