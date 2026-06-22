<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { WorkflowFormType, WorkflowModelType } from '@/common/utils/constants';
import { Icon } from '@/components/chronos-ui/Icon';
import BasicInfo from './BasicInfo.vue';
import { Button } from '@/components/ui/button';
import FormDesign from './FormDesign.vue';
import { CategoryVO, WorkFlowCategoryApi } from '@/common/api/workflow/category';
import { WorkFlowFormApi } from '@/common/api/workflow/form';
import ProcessDesign from './ProcessDesign.vue';
import { toast, Toaster } from 'vue-sonner';

const router = useRouter()

// 表单数据
const formData: any = ref({
    id: undefined,
    name: '',
    key: '',
    category: undefined,
    // icon: undefined,
    description: '',
    type: WorkflowModelType.BPMN,
    formType: WorkflowFormType.NORMAL,
    formId: '',

})

// 流程数据
const processData = ref<any>()

const currentStep = ref(-1) // 步骤控制。-1 用于，一开始全部不展示等当前页面数据初始化完成


// 组件引用
const basicInfoRef = ref()
const formDesignRef = ref()
const processDesignRef = ref()
const categoryList = ref<CategoryVO[]>([])
const formList = ref([])


/** 步骤校验函数 */
const validateBasic = async () => {
    await basicInfoRef.value?.validate()
}

/** 表单设计校验 */
const validateForm = async () => {
    await formDesignRef.value?.validate()
}

/** 流程设计校验 */
const validateProcess = async () => {
    await processDesignRef.value?.validate()
}

const steps = [
    { title: '基本信息', validator: validateBasic },
    { title: '表单设计', validator: validateForm },
    { title: '流程设计', validator: validateProcess },

]

/** 步骤切换处理 */
const handleStepClick = async (index: number) => {
    try {
        if (index !== 0) {
            await validateBasic()
        }
        if (index !== 1) {
            await validateForm()
        }
        if (index !== 2) {
            await validateProcess()
        }

        // 切换步骤
        currentStep.value = index

        // 如果切换到流程设计步骤，等待组件渲染完成后刷新设计器
        if (index === 2) {
            await nextTick()
            // 等待更长时间确保组件完全初始化
            await new Promise((resolve) => setTimeout(resolve, 200))
            if (processDesignRef.value?.refresh) {
                await processDesignRef.value.refresh()
            }
        }
    } catch (error) {
        // throw toast.warning('请先完善当前步骤必填信息')
        throw error
    }
}

/** 校验所有步骤数据是否完整 */
const validateAllSteps = async () => {
    try {


        // 表单设计校验
        try {
            await validateForm()
        } catch (error) {
            currentStep.value = 1
        }

        // 表单设计校验
        try {
            await validateProcess()
        } catch (error) {
            currentStep.value = 2
        }

        // 基本信息校验
        try {
            await validateBasic()
        } catch (error) {
            currentStep.value = 0
        }

    } catch (error) {
        throw error
    }
}

/** 保存操作 */
const handleSave = () => {
    try {
        validateAllSteps()
    } catch (error: any) {
        // message.warning(error.message || '请完善所有步骤的必填信息')
        toast.warning(error.message || '请完善所有步骤的必填信息')
    }

}

const initData = async () => {

    // 获取表单列表
    formList.value = await WorkFlowFormApi.getFormSimpleList()

    // 获取分类列表
    categoryList.value = await WorkFlowCategoryApi.getCategorySimpleList()

    // 最终，设置 currentStep 切换到第一步
    currentStep.value = 0


}

/** 根据类型切换流程数据 */
watch(
    async () => formData.value.type,
    () => {
        if (formData.value.type === WorkflowModelType.BPMN) {
            processData.value = formData.value.bpmnXml
        } else if (formData.value.type === WorkflowModelType.SIMPLE) {
            processData.value = formData.value.simpleModel
        }
        // console.log('加载流程数据', processData.value)
    },
    {
        immediate: true
    }
)

provide('processData', processData)
provide('modelData', formData)

/** 初始化 */
onMounted(async () => {
    await initData()
})

// 添加组件卸载前的清理代码
onBeforeUnmount(() => {
    // 清理所有的引用
    basicInfoRef.value = null
    formDesignRef.value = null
    processDesignRef.value = null
})



</script>

<template>
    <div class="mx-auto">
        <!-- 头部导航栏 -->
        <div class="header-bar">
            <!-- 左侧标题 -->
            <div class="header-left">
                <!-- <Icon icon="ep:arrow-left" class="cursor-pointer flex-shrink-0" @click="handleBack" /> -->
                <span class="title-text">
                    {{ formData.name || '新建流程' }}
                </span>
            </div>

            <!-- 步骤条 -->
            <div class="header-center">
                <div class="steps-container">
                    <div v-for="(step, index) in steps" :key="index" class="step-item" :class="[
                        currentStep === index ? 'active' : '',
                        currentStep > index ? 'completed' : ''
                    ]" @click="handleStepClick(index)">
                        <div class="step-number">
                            <Icon v-if="currentStep > index" icon="tongguo" :size="26" :color="'var(--primary)'" />
                            <span v-else>{{ index + 1 }}</span>
                        </div>
                        <span class="step-title">{{ step.title }}</span>
                        <div v-if="index < steps.length - 1" class="step-line"></div>
                    </div>
                </div>
            </div>

            <!-- 右侧按钮 -->
            <div class="header-right">
                <Button>
                    发 布
                </Button>

                <Button @click="handleSave">
                    <!-- <span v-if="actionType === 'definition'">恢 复</span> -->
                    <!-- <span v-else>保 存</span> -->
                    <span>保 存</span>
                </Button>
            </div>
        </div>

        <!-- 主体内容 -->
        <div class="main-content">
            <!-- 第一步：基本信息 -->
            <div v-if="currentStep === 0" class="content-wrapper">
                <BasicInfo v-model="formData" ref="basicInfoRef" :categoryList="categoryList" />
            </div>

            <!-- 第二步：表单设计 -->
            <div v-if="currentStep === 1" class="mx-auto w-560px">
                <FormDesign v-model="formData" ref="formDesignRef" :formList="formList" />
            </div>

            <ProcessDesign v-if="currentStep === 2" v-model="formData" ref="processDesignRef" />


        </div>
    </div>

</template>

<style lang="scss" scoped>
.header-bar {
    height: 60px;
    border-bottom: 1px solid var(--border-0);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
}

.header-left {
    // width: 200px;
    // display: flex;
    // align-items: center;
    // overflow: hidden;

    .title-text {
        // margin-left: 12px;
        font-size: 16px;
        font-weight: 600;
        // color: #1f2937;
        // overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.header-center {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.steps-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.step-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;

    .step-number {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 600;
        border: 2px solid var(--border-0);
        // background: white;
        color: white;
        transition: all 0.3s ease;
    }

    .step-title {
        margin-left: 8px;
        font-size: 14px;
        // color: #6b7280;
        font-weight: 500;
        white-space: nowrap;
        transition: all 0.3s ease;
    }

    .step-line {
        width: 60px;
        height: 2px;
        background: var(--border-0);
        margin-left: 12px;
        transition: all 0.3s ease;
    }

    &.active {
        .step-number {
            background: var(--primary);
            // border-color: var(--primary);
            // color: white;
        }

        .step-title {
            // color: #3473ff;
            // font-weight: 600;
        }

        .step-line {
            // background: #3473ff;
        }
    }

    &.completed {
        .step-number {
            // background: var(--primary);
            // border-color: #10b981;
            // color: white;
        }

        .step-title {
            // color: var(--primary);
            // color: var(--border-0);
        }

        .step-line {
            background: var(--primary);
        }
    }
}

.header-right {
    // width: 200px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
}

.main-content {
    // padding-top: 80px;
    // min-height: calc(100vh - 60px);
}

.content-wrapper {
    // max-width: 600px;
    // margin: 0 auto;
}
</style>