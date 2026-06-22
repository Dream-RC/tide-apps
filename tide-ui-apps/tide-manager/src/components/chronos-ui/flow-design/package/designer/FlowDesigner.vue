<template>
    <div class="my-process-designer">
        <div class="my-process-designer__header" style="z-index: 999; display: table-row-group">
            <slot name="control-header"></slot>
            <template v-if="!$slots['control-header']">

            </template>
        </div>
        <div class="my-process-designer__container">
            <div class="my-process-designer__canvas" ref="bpmnCanvas" id="bpmnCanvas"
                style=" height: calc(100vh - 140px)">
            </div>
        </div>

    </div>
</template>

<script lang="ts" setup>
import 'bpmn-js/dist/assets/diagram-js.css' // 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
// import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css' // 右侧框样式
import BpmnModeler from 'bpmn-js/lib/Modeler'
import DefaultEmptyXML from './plugins/defaultEmpty'
// 翻译方法
import customTranslate from './plugins/translate/customTranslate'
import translationsCN from './plugins/translate/zh'
// 模拟流转流程
// import tokenSimulation from 'bpmn-js-token-simulation'
// 标签解析构建器
// import bpmnPropertiesProvider from "bpmn-js-properties-panel/lib/provider/bpmn";
// import propertiesPanelModule from 'bpmn-js-properties-panel'
// import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'
// 标签解析 Moddle
import flowableModdleDescriptor from './plugins/descriptor/flowableDescriptor.json'
// 标签解析 Extension
import flowableModdleExtension from './plugins/extension-moddle/flowable'
// 自定义 palette 模块
import customPaletteModule from './plugins/palette'

// 引入json转换与高亮
// import xml2js from 'xml-js'
// import xml2js from 'fast-xml-parser'
import { XmlNode, XmlNodeType, parseXmlString } from 'steady-xml'
// 代码高亮插件
// import hljs from 'highlight.js/lib/highlight'
// import 'highlight.js/styles/github-gist.css'
// hljs.registerLanguage('xml', 'highlight.js/lib/languages/xml')
// hljs.registerLanguage('json', 'highlight.js/lib/languages/json')
// const eventName = reactive({
//   name: ''
// })
import hljs from 'highlight.js' // 导入代码高亮文件
import 'highlight.js/styles/github.css' // 导入代码高亮样式

defineOptions({ name: 'MyFlowDesigner' })

const bpmnCanvas = ref()
const refFile = ref()

const emit = defineEmits([
    'destroy',
    'init-finished',
    'save',
    'commandStack-changed',
    'input',
    'change',
    'canvas-viewbox-changed',
    // eventName.name
    'element-click'
])

const props = defineProps({
    modelValue: String, // xml 字符串
    // valueWatch: true, // xml 字符串的 watch 状态
    processId: String, // 流程 key 标识
    processName: String, // 流程 name 名字
    formId: Number, // 流程 form 表单编号
    translations: {
        // 自定义的翻译文件
        type: Object,
        default: () => { }
    },
    additionalModel: [Object, Array], // 自定义model
    moddleExtension: {
        // 自定义moddle
        type: Object,
        default: () => { }
    },
    onlyCustomizeAddi: {
        type: Boolean,
        default: false
    },
    onlyCustomizeModdle: {
        type: Boolean,
        default: false
    },
    simulation: {
        type: Boolean,
        default: true
    },
    keyboard: {
        type: Boolean,
        default: true
    },
    prefix: {
        type: String,
        default: 'flowable'
    },
    events: {
        type: Array,
        default: () => ['element.click']
    },
})



provide('configGlobal', props)

let bpmnModeler: any = null

const defaultZoom = ref(1)
const recoverable = ref(false)
const revocable = ref(false)

const additionalModules = computed(() => {
    const Modules: any[] = []

    // 仅保留用户自定义扩展模块
    if (props.onlyCustomizeAddi) {
        if (Object.prototype.toString.call(props.additionalModel) == '[object Array]') {
            return props.additionalModel || []
        }
        return [props.additionalModel]
    }

    // 插入用户自定义扩展模块
    if (Object.prototype.toString.call(props.additionalModel) == '[object Array]') {
        Modules.push(...(props.additionalModel as any[]))
    } else {
        props.additionalModel && Modules.push(props.additionalModel)
    }

    // 翻译模块
    const TranslateModule = {
        translate: ['value', customTranslate(translationsCN)]
    }
    Modules.push(TranslateModule)

    // 自定义 palette 模块
    Modules.push(customPaletteModule)

    if (props.prefix === 'flowable') {
        Modules.push(flowableModdleExtension)
    }

    return Modules
})
const moddleExtensions = computed(() => {

    const Extensions: any = {}
    // 仅使用用户自定义模块
    if (props.onlyCustomizeModdle) {
        return props.moddleExtension || null
    }

    // 插入用户自定义模块
    if (props.moddleExtension) {
        for (let key in props.moddleExtension) {
            Extensions[key] = props.moddleExtension[key]
        }
    }

    // 根据需要的 "流程类型" 设置 对应的解析文件
    if (props.prefix === 'flowable') {
        Extensions.flowable = flowableModdleDescriptor
    }
    return Extensions
})



const initBpmnModeler = () => {

    if (bpmnModeler) return

    let data = document.getElementById('bpmnCanvas')

    bpmnModeler = new BpmnModeler({
        container: data as HTMLElement,
        keyboard: props.keyboard,
        additionalModules: additionalModules.value as any[],
        moddleExtensions: moddleExtensions.value
    })

    emit('init-finished', bpmnModeler)
    initModelListeners()
}

const initModelListeners = () => {
    const EventBus = bpmnModeler.get('eventBus')
    console.log(EventBus, 'EventBus')
    // 注册需要的监听事件, 将. 替换为 - , 避免解析异常
    props.events.forEach((event: any) => {
        EventBus.on(event, function (eventObj) {
            let eventName = event.replace(/\./g, '-')
            // eventName.name = eventName
            let element = eventObj ? eventObj.element : null
            console.log(eventName, 'eventName')
            console.log(element, 'element')
            emit('element-click', element, eventObj)
            // emit(eventName, element, eventObj)
        })
    })
    // 监听图形改变返回xml
    EventBus.on('commandStack.changed', async (event) => {
        try {
            recoverable.value = bpmnModeler.get('commandStack').canRedo()
            revocable.value = bpmnModeler.get('commandStack').canUndo()
            let { xml } = await bpmnModeler.saveXML({ format: true })
            emit('commandStack-changed', event)
            emit('input', xml)
            emit('change', xml)
            emit('save', xml)
        } catch (e: any) {
            console.error(`[Process Designer Warn]: ${e.message || e}`)
        }
    })
    // 监听视图缩放变化
    bpmnModeler.on('canvas.viewbox.changed', ({ viewbox }) => {
        emit('canvas-viewbox-changed', { viewbox })
        const { scale } = viewbox
        defaultZoom.value = Math.floor(scale * 100) / 100
    })
}


/* 创建新的流程图 */
const createNewDiagram = async (xml?: string) => {
    console.log(xml, 'xml')

    // 将字符串转换成图显示出来
    let newId = props.processId || `Process_${new Date().getTime()}`
    let newName = props.processName || `业务流程_${new Date().getTime()}`

    let xmlString = xml || DefaultEmptyXML(newId, newName, props.prefix)
    try {
        // console.log(xmlString, 'xmlString')
        let { warnings } = await bpmnModeler.importXML(xmlString)
        console.log(warnings, 'warnings')
        if (warnings && warnings.length) {
            warnings.forEach((warn: any) => console.warn(warn))
        }
    } catch (e: any) {
        console.error(`[Process Designer Warn]: ${e.message || e}`)
    }
}


/* ------------------------------------------------ refs methods ------------------------------------------------------ */



/* ------------------------------------------------ methods ------------------------------------------------------ */
onMounted(() => {
    initBpmnModeler()
    createNewDiagram(props.modelValue)
})
onBeforeUnmount(() => {
    if (bpmnModeler) bpmnModeler.destroy()
    emit('destroy', bpmnModeler)
    bpmnModeler = null
})
</script>