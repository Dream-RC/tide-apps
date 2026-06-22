<script setup lang="ts">
import { ModelVO } from '@/common/api/workflow/model';
import { WorkflowFormType } from '@/common/utils/constants';
import { MyProcessPenal } from '@/components/chronos-ui/flow-design/package';
import MyFlowDesigner from '@/components/chronos-ui/flow-design/package/designer';

// 自定义元素选中时的弹出菜单（修改 默认任务 为 用户任务）
import CustomContentPadProvider from '@/components/chronos-ui/flow-design/package/designer/plugins/content-pad'
// 自定义左侧菜单（修改 默认任务 为 用户任务）
import CustomPaletteProvider from '@/components/chronos-ui/flow-design/package/designer/plugins/palette';

defineOptions({
    name: 'BpmnModelEditor',
})

defineProps<{
    modelId?: string
    modelKey: string
    modelName: string
    // modelValue?: string
}>()
const emit = defineEmits(['success', 'init-finished'])

// 注入流程数据
const xmlString = inject('processData') as Ref
// 注入模型数据
const modelData = inject('modelData') as Ref

// 注入模型数据
const modeler = shallowRef() // BPMN Modeler

const model = ref<ModelVO>() // 流程模型的信息

const controlForm = ref({
    simulation: true,
    labelEditing: false,
    labelVisible: false,
    prefix: 'flowable',
    headerButtonSize: 'mini',
    additionalModel: [CustomPaletteProvider, CustomContentPadProvider]
})

/** 添加/修改模型 */
const save = async (bpmnXml: string) => {
    try {
        xmlString.value = bpmnXml
        emit('success', bpmnXml)
    } catch (error) {
        console.error('保存失败:', error)
        // message.error('保存失败')
    }
}


/** 初始化 modeler */
const initModeler = async (item: any) => {
    console.log(xmlString);

    // 先初始化模型数据
    model.value = modelData.value
    modeler.value = item
}

/** 监听表单 ID 变化，加载表单数据 */
watch(
    () => modelData.value.formId,
    async (newFormId) => {

        if (newFormId && modelData.value.formType === WorkflowFormType.NORMAL) {
            //   const data = await FormApi.getForm(newFormId)
            //   formFields.value = data.fields
        } else {
            // formFields.value = []
        }
    },
    { immediate: true }
)


// 在组件卸载时清理
onBeforeUnmount(() => {
    modeler.value = null
    // 清理全局实例
    const w = window as any
    if (w.bpmnInstances) {
        w.bpmnInstances = null
    }
})

</script>

<template>
    <!-- v-bind="controlForm" -->
    <!-- :value="xmlString" -->
    <MyFlowDesigner key="designer" v-model="xmlString" keyboard ref="processDesigner" @init-finished="initModeler"
        :additionalModel="controlForm.additionalModel" :model="model" :process-id="modelKey" :process-name="modelName"
        @save="save" />

    <!-- 流程属性器，负责编辑每个流程节点的属性 -->
    <MyProcessPenal v-if="modeler" key="penal" :bpmnModeler="modeler" :prefix="controlForm.prefix" class="process-panel"
        :model="model" />
</template>

<style lang="scss"></style>