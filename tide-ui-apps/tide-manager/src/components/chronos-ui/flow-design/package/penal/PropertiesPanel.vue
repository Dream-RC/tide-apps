<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import ElementBaseInfo from './base/ElementBaseInfo.vue';
import { Icon } from '@/components/chronos-ui/Icon';
import ElementTask from './task/ElementTask.vue';

defineOptions({
  name: 'PropertiesPanel'
})

/**
 * 侧边栏
 * @Author RC
 * @Date 2021年3月31日18:57:51
 */
const props = defineProps({
  bpmnModeler: {
    type: Object,
    default: () => { }
  },
  prefix: {
    type: String,
    default: 'camunda'
  },
  width: {
    type: Number,
    default: 360
  },
  idEditDisabled: {
    type: Boolean,
    default: false
  },
  model: Object // 流程模型的数据
})

const activeTab = ref('base')
const elementId = ref('')
const elementType = ref('')
const elementBusinessObject = ref<any>({}) // 元素 businessObject 镜像，提供给需要做判断的组件使用
const conditionFormVisible = ref(false) // 流转条件设置
const formVisible = ref(false) // 表单配置
const bpmnElement = ref()
const isReady = ref(false)

const type = ref('time')
const condition = ref('')
provide('prefix', props.prefix)
provide('width', props.width)

// 初始化 bpmnInstances
const initBpmnInstances = () => {
  if (!props.bpmnModeler) return false
  try {
    const instances = {
      modeler: props.bpmnModeler,
      modeling: props.bpmnModeler.get('modeling'),
      moddle: props.bpmnModeler.get('moddle'),
      eventBus: props.bpmnModeler.get('eventBus'),
      bpmnFactory: props.bpmnModeler.get('bpmnFactory'),
      elementFactory: props.bpmnModeler.get('elementFactory'),
      elementRegistry: props.bpmnModeler.get('elementRegistry'),
      replace: props.bpmnModeler.get('replace'),
      selection: props.bpmnModeler.get('selection')
    }

    // 检查所有实例是否都存在
    const allInstancesExist = Object.values(instances).every((instance) => instance)
    if (allInstancesExist) {
      const w = window as any
      w.bpmnInstances = instances
      return true
    }
    return false
  } catch (error) {
    console.error('初始化 bpmnInstances 失败:', error)
    return false
  }
}

const bpmnInstances = () => (window as any)?.bpmnInstances

// 监听 props.bpmnModeler 然后 initModels
const unwatchBpmn = watch(
  () => props.bpmnModeler,
  async () => {
    // 避免加载时 流程图 并未加载完成
    if (!props.bpmnModeler) {
      console.log('缺少props.bpmnModeler')
      return
    }

    try {
      // 等待 modeler 初始化完成
      await nextTick()
      if (initBpmnInstances()) {
        isReady.value = true
        await nextTick()
        getActiveElement()
      } else {
        console.error('modeler 实例未完全初始化')
      }
    } catch (error) {
      console.error('初始化失败:', error)
    }
  },
  {
    immediate: true
  }
)

const getActiveElement = () => {
  if (!isReady.value || !props.bpmnModeler) return

  // 初始第一个选中元素 bpmn:Process
  initFormOnChanged(null)
  props.bpmnModeler.on('import.done', (e) => {
    console.log(e, 'eeeee')
    initFormOnChanged(null)
  })
  // 监听选择事件，修改当前激活的元素以及表单
  props.bpmnModeler.on('selection.changed', ({ newSelection }) => {
    initFormOnChanged(newSelection[0] || null)
  })
  props.bpmnModeler.on('element.changed', ({ element }) => {
    // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
    if (element && element.id === elementId.value) {
      initFormOnChanged(element)
    }
  })
}

// 初始化数据
const initFormOnChanged = (element) => {
  if (!isReady.value || !bpmnInstances()) return

  let activatedElement = element
  if (!activatedElement) {
    activatedElement =
      bpmnInstances().elementRegistry.find((el) => el.type === 'bpmn:Process') ??
      bpmnInstances().elementRegistry.find((el) => el.type === 'bpmn:Collaboration')
  }
  if (!activatedElement) return

  try {
    console.log(`
                ----------
        select element changed:
                  id:  ${activatedElement.id}
                type:  ${activatedElement.businessObject.$type}
                ----------
                `)
    console.log('businessObject: ', activatedElement.businessObject)
    bpmnInstances().bpmnElement = activatedElement
    bpmnElement.value = activatedElement
    elementId.value = activatedElement.id
    elementType.value = activatedElement.type.split(':')[1] || ''
    elementBusinessObject.value = JSON.parse(JSON.stringify(activatedElement.businessObject))
    conditionFormVisible.value = !!(
      elementType.value === 'SequenceFlow' &&
      activatedElement.source &&
      activatedElement.source.type.indexOf('StartEvent') === -1
    )
    formVisible.value = elementType.value === 'UserTask' || elementType.value === 'StartEvent'
  } catch (error) {
    console.error('初始化表单数据失败:', error)
  }
}

onBeforeUnmount(() => {
  const w = window as any
  w.bpmnInstances = null
  isReady.value = false
})

watch(
  () => elementId.value,
  () => {
    activeTab.value = 'base'
  }
)

function updateNode() {
  const moddle = window.bpmnInstances?.moddle
  const modeling = window.bpmnInstances?.modeling
  const elementRegistry = window.bpmnInstances?.elementRegistry
  if (!moddle || !modeling || !elementRegistry) return

  const element = elementRegistry.get(props.businessObject.id)
  if (!element) return

  let timerDef = moddle.create('bpmn:TimerEventDefinition', {})
  if (type.value === 'time') {
    timerDef.timeDate = moddle.create('bpmn:FormalExpression', { body: condition.value })
  } else if (type.value === 'duration') {
    timerDef.timeDuration = moddle.create('bpmn:FormalExpression', { body: condition.value })
  } else if (type.value === 'cycle') {
    timerDef.timeCycle = moddle.create('bpmn:FormalExpression', { body: condition.value })
  }

  modeling.updateModdleProperties(element, element.businessObject, {
    eventDefinitions: [timerDef]
  })
}

// 初始化和监听
function syncFromBusinessObject() {
  if (props.businessObject) {
    const timerDef = (props.businessObject.eventDefinitions || [])[0]
    if (timerDef) {
      if (timerDef.timeDate) {
        type.value = 'time'
        condition.value = timerDef.timeDate.body
      } else if (timerDef.timeDuration) {
        type.value = 'duration'
        condition.value = timerDef.timeDuration.body
      } else if (timerDef.timeCycle) {
        type.value = 'cycle'
        condition.value = timerDef.timeCycle.body
      }
    }
  }
}
onMounted(syncFromBusinessObject)
watch(() => props.businessObject, syncFromBusinessObject, { deep: true })

</script>

<template>
  <div class="process-panel__container" :style="{ width: `${width}px`, maxHeight: '600px' }">
    <Accordion collapsible :value="activeTab" v-if="isReady" class="space-y-2">

      <AccordionItem value="base">
        <AccordionTrigger class="flex items-center gap-2">
          <Icon icon="ep:info-filled" />
          常规
        </AccordionTrigger>
        <AccordionContent>
          <ElementBaseInfo :id-edit-disabled="idEditDisabled" :business-object="elementBusinessObject"
            :type="elementType" :model="model" />
        </AccordionContent>
      </AccordionItem>

      <!-- <AccordionItem v-if="formVisible" value="form" key="form">
        <AccordionTrigger class="flex items-center gap-2">
          <Icon icon="ep:list" />表单
        </AccordionTrigger>
        <AccordionContent>
          <ElementForm :id="elementId" :type="elementType" />
        </AccordionContent>
      </AccordionItem> -->

      <!-- 
      <AccordionItem v-if="elementType === 'Process'" value="message" key="message">
        <AccordionTrigger class="flex items-center gap-2">
          <Icon icon="ep:comment" />消息与信号
        </AccordionTrigger>
        <AccordionContent>
          <SignalAndMessage />
        </AccordionContent>
      </AccordionItem> -->

      <!-- 
      <AccordionItem v-if="conditionFormVisible" value="condition" key="condition">
        <AccordionTrigger class="flex items-center gap-2">
          <Icon icon="ep:promotion" />流转条件
        </AccordionTrigger>
        <AccordionContent>
          <flow-condition :business-object="elementBusinessObject" :type="elementType" />
        </AccordionContent>

      <AccordionItem value="task" v-if="isTaskCollapseItemShow(elementType)" key="task">
        <AccordionTrigger class="flex items-center gap-2">
          <Icon icon="ep:checked" />{{ getTaskCollapseItemName(elementType) }}
        </AccordionTrigger>
        <AccordionContent>
          <ElementTask :id="elementId" :type="elementType" />
        </AccordionContent>
      </AccordionItem> -->
      <!-- <AccordionItem v-if="elementType.indexOf('Task') !== -1" value="multiInstance" key="multiInstance">
        <AccordionTrigger class="flex items-center gap-2">
          <Icon icon="ep:help-filled" />多人审批方式
        </AccordionTrigger>
        <AccordionContent>
          <element-multi-instance :id="elementId" :business-object="elementBusinessObject" :type="elementType" />
        </AccordionContent>
      </AccordionItem> -->
      <!-- <AccordionItem value="listeners" key="listeners">
        <AccordionTrigger class="flex items-center gap-2">
          <Icon icon="ep:bell-filled" />执行监听器
        </AccordionTrigger>
        <AccordionContent>
          <element-listeners :id="elementId" :type="elementType" />
        </AccordionContent>
      </AccordionItem> -->
      <!-- <AccordionItem v-if="elementType === 'UserTask'" value="taskListeners" key="taskListeners">
        <AccordionTrigger class="flex items-center gap-2">
          <Icon icon="ep:bell-filled" />任务监听器
        </AccordionTrigger>
        <AccordionContent>
          <user-task-listeners :id="elementId" :type="elementType" />
        </AccordionContent>
      </AccordionItem> -->
      <!-- <AccordionItem value="extensions" key="extensions">
        <AccordionTrigger class="flex items-center gap-2">
          <Icon icon="ep:circle-plus-filled" />扩展属性
        </AccordionTrigger>
        <AccordionContent>
          <element-properties :id="elementId" :type="elementType" />
        </AccordionContent>
      </AccordionItem> -->
      <!-- <AccordionItem value="other" key="other">
        <AccordionTrigger class="flex items-center gap-2">
          <Icon icon="ep:promotion" />其他
        </AccordionTrigger>
        <AccordionContent>
          <element-other-config :id="elementId" />
        </AccordionContent>
      </AccordionItem> -->
      <!-- <AccordionItem value="customConfig" key="customConfig">
        <AccordionTrigger class="flex items-center gap-2">
          <Icon icon="ep:tools" />自定义配置
        </AccordionTrigger>
        <AccordionContent>
          <element-custom-config :id="elementId" :type="elementType" :business-object="elementBusinessObject" />
        </AccordionContent>
      </AccordionItem> -->
      <!-- 新增的时间事件配置项 -->
      <!-- <AccordionItem v-if="elementType === 'IntermediateCatchEvent'" value="timeEvent">
        <AccordionTrigger class="flex items-center gap-2">
          <Icon icon="ep:timer" />时间事件
        </AccordionTrigger>
        <AccordionContent>
          <TimeEventConfig :businessObject="elementBusinessObject" :key="elementId" />
        </AccordionContent>
      </AccordionItem> -->
    </Accordion>
  </div>
</template>


<style lang="scss">
.process-panel__container {
  position: absolute;
  top: 172px;
  right: 70px;
}
</style>