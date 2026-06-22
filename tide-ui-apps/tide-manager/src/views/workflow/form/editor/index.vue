<script setup lang="ts">
import ComponentsPanel from '@/components/chronos-ui/form-designer/ComponentsPanel.vue';
import DesignCanvas from '@/components/chronos-ui/form-designer/DesignCanvas.vue';
import PropertiesPanel from '@/components/chronos-ui/form-designer/PropertiesPanel.vue';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useFormDesignerStore } from '@/store/modules/formDesigner';
import FormPreview from '../components/form-preview.vue';
import { FormVO, WorkFlowFormApi } from '@/common/api/workflow/form';
import { id } from 'zod/v4/locales';
import { CommonStatusEnum } from '@/common/utils/constants';
import { Toaster, toast } from 'vue-sonner';
import '@/styles/index.scss'


defineOptions({
    name: 'WorkflowFormEditor',
})

const formDesignerStore = useFormDesignerStore()
// 表单ID（从URL参数获取）
const formId = ref<string>('')
const isEditMode = computed(() => !!formId.value)

// 获取URL参数
const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('id') || ''
}


// 清空画布
const clearForm = async () => {
    if (formDesignerStore.currentForm.components.length === 0) {
        toast.warning('画布已经是空的')
        return
    }

    try {
        // await ElMessageBox.confirm(
        //   '确定要清空画布吗？此操作不可恢复！',
        //   '确认清空',
        //   {
        //     confirmButtonText: '确定',
        //     cancelButtonText: '取消',
        //     type: 'warning'
        //   }
        // )

        formDesignerStore.clearForm()
        toast.success('画布已清空')
    } catch (error) {
        // 用户取消操作
    }
}


// 保存表单
const saveForm = async () => {

    if (!formDesignerStore.currentForm.name.trim()) {
        console.log('请输入表单名称');
        return
    }

    if (formDesignerStore.currentForm.components.length === 0) {
        console.log('表单内容不能为空');
        return
    }

    try {

        // 构造保存数据
        const formConfigObject = {
            labelWidth: formDesignerStore.currentForm.labelWidth,
            labelPosition: formDesignerStore.currentForm.labelPosition,
            size: formDesignerStore.currentForm.size,
            disabled: formDesignerStore.currentForm.disabled,
            inline: formDesignerStore.currentForm.inline,
            components: formDesignerStore.currentForm.components,
            style: formDesignerStore.currentForm.style,
            displayRules: formDesignerStore.currentForm.displayRules || []
        }

        // console.log('3. formConfigObject (序列化前):', formConfigObject)
        // console.log('4. formConfigObject.displayRules:', formConfigObject.displayRules)

        const formConfigString = JSON.stringify(formConfigObject)
        // console.log('5. formConfig (JSON字符串):', formConfigString)

        const formData = {
            id: undefined,
            name: formDesignerStore.currentForm.name,
            description: formDesignerStore.currentForm.description || '',
            config: formConfigString,
            status: CommonStatusEnum.ENABLE
        }

        // console.log('6. 完整保存数据 formData:', formData)
        // console.log('7. formData.config:', formData.config)
        // console.log('=== 保存表单 - 数据准备完成 ===')
        // console.log('8. formData.id:', formId.value)
        if (isEditMode.value) {
            formData.id = formId.value


            toast.promise(
                await WorkFlowFormApi.updateForm(formData as FormVO),
                {
                    loading: '更新表单中...',
                    success: () => '更新成功!',
                    error: (err: any) => `更新失败: ${err.message || '未知错误'}`,
                }
            )

        } else {
            toast.promise(
                await WorkFlowFormApi.createForm(formData as FormVO),
                {
                    loading: '创建表单中...',
                    success: () => '创建成功!',
                    error: (err: any) => `创建失败: ${err.message || '未知错误'}`,
                }
            )
        }

        // 保存成功后跳转回表单列表
        setTimeout(() => {
            window.location.href = '/workflow/form'
        }, 200)



    } catch (error) {
    }

}

// 预览表单
// const previewForm = () => {
//     if (formDesignerStore.currentForm.components.length === 0) {
//         return
//     }
//     previewDrawerVisible.value = true
// }


// 加载表单数据
const loadFormData = async (id: string) => {
    try {
        const data = await WorkFlowFormApi.getForm(id)
        // console.log(data.config)
        // 解析表单配置并导入到设计器
        if (data.config) {
            const config = JSON.parse(data.config)

            formDesignerStore.importForm({
                id: data.id,
                name: data.name,
                description: data.description,
                ...config
            })


        } else {

        }


    } catch (error) {
    }
}


// 初始化表单
onMounted(async () => {
    formId.value = getUrlParams()
    console.log(formId.value)

    if (isEditMode.value) {
        // 编辑模式：加载现有表单数据
        await loadFormData(formId.value)
    } else {
        // 新增模式：初始化空表单
        formDesignerStore.initForm()
    }
})

/** 添加/修改操作 */
const formPreviewRef = ref()

const openFormPreview = () => {
    formPreviewRef.value.openFormPreview()
}


</script>

<template>
    <div class="form-designer">
        <!-- 顶部工具栏 -->
        <div class="designer-header ">
            <div class="header-left">
                <!-- <h2>{{ isEditMode ? '编辑表单' : '新建表单' }}</h2> -->
                <!-- <el-input v-model="formDesignerStore.currentForm.name" placeholder="请输入表单名称" class="form-name-input"
                    @blur="updateFormName" /> -->
            </div>
            <div class="header-right">
                <Button @click="openFormPreview()">
                    预览表单
                </Button>
                <Button @click="saveForm">
                    {{ isEditMode ? '更新表单' : '保存表单' }}
                </Button>
                <Button @click="clearForm">
                    清空画布
                </Button>
            </div>
        </div>

        <!-- 主内容区域 -->
        <div class="designer-body mt-4">
            <!-- 左侧组件面板 -->
            <div class="designer-left">
                <div class="components-panel">
                    <div class="panel-content">
                        <ComponentsPanel />
                    </div>
                </div>
            </div>

            <!-- 中间设计画布 -->
            <div class="designer-center">
                <div class="canvas-container">
                    <div class="canvas-header">
                        <span>设计画布</span>
                    </div>
                    <Separator class="my-1 benefits-separator" />

                    <DesignCanvas />
                </div>
            </div>

            <div class="designer-right">
                <div class="properties-panel">
                    <div class="panel-header">
                        <h3>属性配置</h3>
                    </div>
                    <div class="panel-content">
                        <PropertiesPanel />
                    </div>
                </div>
            </div>


        </div>

    </div>

    <FormPreview ref="formPreviewRef" />
    <Toaster />

</template>

<style scoped lang="scss">
// .benefits-separator {
//     width: 100%;
//     background-image: url(@/assets/ui/separator/separator.png);
//     background-size: 100% 100%;
//     background-position: top;
//     background-repeat: no-repeat;
// }


.form-designer {
    height: calc(100vh - 64px);
    display: flex;
    flex-direction: column;
    // background: var(--bg-secondary);
    // -webkit-mask:
    //     linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.5)),
    //     url(@/assets/noise/noise.png);
    // filter: contrast(10);

    .designer-header {
        height: 60px;
        background: var(--bg-card);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        box-shadow: var(--shadow-sm);
        border-radius: 12px;

        .header-left {
            display: flex;
            align-items: center;
            gap: 20px;

            // h2 {
            //     margin: 0;
            //     font-size: 18px;
            //     color: var(--text-primary);
            // }

            // .form-name-input {
            //     width: 300px;
            // }
        }

        .header-right {
            display: flex;
            gap: 12px;
        }
    }




    .designer-body {
        flex: 1;
        display: flex;
        overflow: hidden;


        .designer-left {
            width: 260px;
            // background: var(--bg-card);
            // border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            overflow: hidden;

            // box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.1), 4px 4px 0px rgba(0, 0, 0, 0.05), 6px 6px 0px rgba(0, 0, 0, 0.03);
            // border: 2px solid #2c2c2c;
            // -webkit-mask:
            //     linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.5)),
            //     url(@/assets/noise/noise.png);

            border-radius: 12px;

            .components-panel {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-height: 0;

                .panel-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--border-color);
                    flex-shrink: 0;


                    // h3 {
                    //     margin: 0 0 12px 0;
                    //     font-size: 14px;
                    //     color: var(--text-primary);
                    //     background: transparent;
                    //     letter-spacing: 0.18em;
                    // }
                }

                .panel-content {
                    flex: 1;
                    overflow-y: auto;
                    min-height: 0;
                }
            }
        }

        .designer-center {
            flex: 1;
            display: flex;
            flex-direction: column;
            margin: 0 1px;
            overflow: hidden;

            .canvas-container {
                flex: 1;
                background: var(--bg-card);
                display: flex;
                flex-direction: column;
                min-height: 0;
                overflow: hidden;

                .canvas-header {
                    height: 50px;
                    padding: 0 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: transparent;
                    flex-shrink: 0;

                    span {
                        font-weight: 500;
                        color: var(--text-primary);
                    }
                }

                :deep(.design-canvas) {
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto;
                }
            }
        }

        .designer-right {
            width: 310px;
            background: var(--bg-card);
            border-left: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            overflow: hidden;

            .properties-panel {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-height: 0;

                .panel-header {
                    padding: 15px 16px;
                    border-bottom: 1px solid var(--border-color);
                    flex-shrink: 0;

                    h3 {
                        margin: 0;
                        font-size: 14px;
                        color: var(--text-primary);
                        background: transparent;
                    }
                }

                .panel-content {
                    flex: 1;
                    overflow-y: auto;
                    min-height: 0;
                }
            }
        }

    }

}
</style>