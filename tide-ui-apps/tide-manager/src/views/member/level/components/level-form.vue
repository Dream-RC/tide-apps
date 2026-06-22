<script lang="ts" setup>
import { Toaster, toast } from 'vue-sonner'

import { MemberLevelVO, MemberLevelApi } from '@/common/api/member/level';
import { CommonStatusEnum } from '@/common/utils/constants';
import { DICT_TYPE, getIntDictOptions } from '@/common/utils/dict';
import Dropfile from '@/components/chronos-ui/drop-file/Dropfile.vue';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import * as z from 'zod'

const { currentRoute, push } = useRouter()

const route = useRoute() // 路由
const id = route.params.id // 路由参数

const formSchema = toTypedSchema(
    z.object({
        id: z.string().optional(),
        name: z.string().min(1, "等级名称不能为空"),
        icon: z.string().optional(),
        backgroundUrl: z.string().optional(),
        benefits: z.array(z.string()).optional(), // 新增权益字段
        spaceLimit: z.number().default(0),
        storageSpace: z.number().default(0),
        memberLimit: z.number().default(0),


        sort: z.number().default(0),
        // value: z.string().min(1, "类型不能为空"),
        status: z.number().default(0),
        memberPrice: z.number().default(0)
            .transform((val) => Math.round(val * 100) / 100), // 转成分
        // dictType: z.string().default(props.dictType),
        // description: z.string().optional(),
    })
)

const benefitOptions = [
    { label: '存储空间', value: 'storage_space' },
    { label: '项目限制', value: 'project_limit' },

];


const { handleSubmit, resetForm, values } = useForm({
    validationSchema: formSchema,
    initialValues: {
        id: undefined,
        name: '',
        icon: undefined,
        backgroundUrl: undefined,
        benefits: ['storage_space', 'project_limit'], // 新增默认开启存储空间权益  // 初始化为空数组
        spaceLimit: 1,
        storageSpace: 20,
        memberLimit: 2,
        memberPrice: 0,
        sort: undefined,

        // value: '',
        // dictType: props.dictType,
        status: CommonStatusEnum.ENABLE,
        // description: '',
    },
})

const onSubmit = async () => {
    console.log("----------------");
    // console.log(values);
    // dialogVisible.value = true
    // dialogTitle.value = t('action.' + type)
    // formType.value = type


    try {

        if (id) {
            values.id = id as string
            toast.promise(
                await MemberLevelApi.updateLevel(values as MemberLevelVO),
                {
                    loading: '更新会员等级数据中...',
                    success: () => '更新 1 条会员等级成功!',
                    error: (err: any) => `修改失败: ${err.message || '未知错误'}`,
                }
            )
            push({ path: '/member/level' })


        } else {
            toast.promise(
                await MemberLevelApi.createLevel(values as MemberLevelVO),
                {
                    loading: '创建会员等级数据中...',
                    success: () => '创建 1 条会员等级成功!',
                    error: (err: any) => `创建失败: ${err.message || '未知错误'}`,
                }
            )

            push({ path: '/member/level' })
        }




        // const data = formData.value as unknown as MemberLevelApi.LevelVO
        // if (formType.value === 'create') {
        // await LevelApi.createLevel(data)
        // message.success(t('common.createSuccess'))
        // } else {
        // await LevelApi.updateLevel(data)
        // message.success(t('common.updateSuccess'))
        // }
        // dialogVisible.value = false
        // 发送操作成功的事件
        // emit('success')
    } finally {
        // formLoading.value = false
    }


    // }
}

// 允许 field.value 可选，默认空数组
const toggleFieldArray = (field: { value?: string[] }, value: string) => {

    if (!field.value) field.value = [];
    const index = field.value.indexOf(value);
    if (index > -1) {
        field.value.splice(index, 1);
    } else {
        field.value.push(value);
    }

};

const isChecked = (field: { value?: string[] }, value: string) => {
    return field.value?.includes(value);
};


onMounted(async () => {

    console.log(typeof id);


    if (id) {
        try {
            const data = await MemberLevelApi.getLevel(id as string)
            // 设置表单数据
            resetForm({ values: data })
        } finally {
            // formLoading.value = false
        }
    }

})




</script>

<template>
    <!-- px-12 no-scrollbar overflow-y-auto -->
    <form id="form-vee-demo" @submit.prevent="onSubmit" class="level-form">

        <div class="grid grid-cols-3 gap-6 pb-6 px-4">
            <FormField v-slot="{ componentField }" name="name">
                <FormItem class="">
                    <FormLabel>等级名称</FormLabel>
                    <FormControl>
                        <Input placeholder="请输入等级名称" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>


            <FormField v-slot="{ componentField }" name="memberPrice">
                <FormItem class="">
                    <FormLabel>会员价格</FormLabel>
                    <FormControl>
                        <InputGroup>
                            <InputGroupInput type="number" placeholder="请输入会员价格" v-bind="componentField" />
                            <InputGroupAddon :align="'inline-end'">
                                元/月
                            </InputGroupAddon>
                        </InputGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>

        </div>

        <div class="grid grid-cols-3 gap-4 pb-6 px-4 ">

            <FormField v-slot="{ componentField }" name="icon">
                <Dropfile>
                    <template #title>
                        <span class="text-xs text-gray-400">上传图标</span>
                    </template>
                </Dropfile>
            </FormField>

            <FormField v-slot="{ componentField }" name="backgroundUrl">
                <Dropfile>
                    <template #title>
                        <span class="text-xs text-gray-400">上传背景图</span>
                    </template>
                </Dropfile>

            </FormField>


        </div>


        <div class="pb-6 px-4">
            <FormField v-slot="{ componentField }" name="status" type="radio">
                <FormItem class="">
                    <FormLabel>等级状态</FormLabel>
                    <FormControl>
                        <RadioGroup v-bind="componentField" class="flex items-center  space-x-4">
                            <template v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value">
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

        <!-- <div class="pb-6">
            <FormField v-slot="{ componentField }" name="description">
                <FormItem class="">
                    <FormLabel>备注</FormLabel>
                    <FormControl>
                        <Textarea placeholder="请输入备注." v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>
        </div> -->


        <div class="pb-6">

            <div class="benefits-card-head">
                等级权益
            </div>

            <Separator class="my-4 benefits-separator" />

            <FormField v-slot="{ field }" name="benefits">
                <FormItem>
                    <FormLabel class="card-body">选择需要开启的等级权益</FormLabel>
                    <FormControl>

                        <div class="checkbox-group flex flex-row gap-5">
                            <div v-for="option in benefitOptions" :key="option.value" class="flex items-center gap-2">
                                <Switch :id="option.value" :modelValue="isChecked(field, option.value)"
                                    @click="() => toggleFieldArray(field, option.value)" />
                                <Label :for="option.value">{{ option.label }}</Label>
                            </div>
                        </div>

                        <Card class="benefit-card" v-if="isChecked(field, benefitOptions[0].value)">
                            <div class="card-title">文件存储</div>

                            <div class="grid grid-cols-3 gap-4 pb-6">

                                <FormField v-slot="{ componentField }" name="storageSpace">
                                    <FormItem class="card-item">
                                        <FormLabel>存储空间</FormLabel>
                                        <FormControl>
                                            <InputGroup>
                                                <InputGroupInput type="number" placeholder="请输入存储空间大小"
                                                    v-bind="componentField" />
                                                <InputGroupAddon :align="'inline-end'">
                                                    MB
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                </FormField>

                            </div>


                        </Card>

                        <Card class="benefit-card" v-if="isChecked(field, benefitOptions[1].value)">
                            <div class="card-title">空间限制</div>

                            <div class="grid grid-cols-3 gap-4 pb-6">
                                <FormField v-slot="{ componentField }" name="spaceLimit">
                                    <FormItem class="card-item">
                                        <FormLabel>限制数量</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="请输入限制项目数量" v-bind="componentField" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                </FormField>

                                <FormField v-slot="{ componentField }" name="memberLimit">
                                    <FormItem class="card-item">
                                        <FormLabel>成员限制</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="请输入限制项目成员数量" v-bind="componentField" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                </FormField>
                            </div>
                        </Card>


                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>
        </div>


        <div class="flex justify-end gap-6">
            <router-link to="/member/level">
                <Button type="button" variant="outline">
                    取消
                </Button>
            </router-link>

            <Button type="submit" form="form-vee-demo">
                确定
            </Button>
        </div>

    </form>


</template>

<style lang="scss" scoped>
.level-form {
    padding: 20px;
}

.card-body {
    padding: 0 20px;
    border-bottom-color: rgb(51, 51, 51);
    color: var(--text-color);
    font-size: 12px;
    line-height: 18px;
}

.checkbox-group {
    margin: 20px;

}

.card-item {
    padding: 0 40px;
}



.benefits-card-head {
    // backdrop-filter: blur(20px);
    // --color-gradient-credits-bg: linear-gradient(135deg, #262e27 0%, #131413 100%);
    // --item-bg-color: var(--color-gradient-credits-bg);
    // background: var(--item-bg-color);

    // border-bottom: 1px solid var(--border0);
    padding: 8px 20px;
    line-height: 1;
    margin-bottom: 20px;

    p {
        display: inline-block;
        width: auto;
        line-height: 28px;
        color: #070707;
        // overflow: hidden;
        // text-overflow: ellipsis;
        // white-space: nowrap;
        font-weight: 700;
        font-size: 16px;
    }


}


.benefit-card {
    background: var(--background);
    padding: 20px 30px;
    box-sizing: border-box;
    border-radius: 10px;
    width: 100%;
    margin-bottom: 30px;
    position: relative;

    .card-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--text-color-1);
    }

}




.card-title:before {
    --primary: #fb6638;
    position: absolute;
    content: "";
    top: 21px;
    left: 17px;
    width: 4px;
    background-color: var(--primary);
    height: 20px;
}

.benefits-separator {
    // background-color: var(--border0);
    // border: none;
    // height: 1px;
    width: 100%;
    // margin: 20px auto;

    background-image: url(@/assets/ui/separator/separator.png);
    background-size: 100% 100%;
    background-position: top;
    background-repeat: no-repeat;
}
</style>