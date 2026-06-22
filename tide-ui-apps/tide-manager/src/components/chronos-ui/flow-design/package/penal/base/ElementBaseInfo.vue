<template>
  <div class="panel-tab__content space-y-4">
    <!-- {{ needProps.type }} -->
    <form>

      <div v-if="needProps.type == 'bpmn:Process'" class="space-y-3">
        <!-- 如果是 Process 信息的时候，使用自定义表单 -->
        <FormField v-slot="{ componentField }" name="id">
          <FormItem>
            <FormLabel>流程标识</FormLabel>
            <FormControl>
              <Input v-bind="componentField" v-model="needProps.id"
                :disabled="needProps.id !== undefined && needProps.id.length > 0" placeholder="请输入流程标识"
                @change="handleKeyUpdate" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>流程名称</FormLabel>
            <FormControl>
              <Input v-bind="componentField" v-model="needProps.name" placeholder="请输入流程名称" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <div v-else class="space-y-3">
        <Label>ID</Label>
        <Input v-model="elementBaseInfo.id" />

        <Label>名称</Label>
        <Input v-model="elementBaseInfo.name" />
      </div>
    </form>

    <!-- 

     <div v-else class="space-y-3">
      <div class="space-y-1.5">
        <Label class="text-sm font-medium">ID</Label>
        <Input v-model="elementBaseInfo.id" @change="updateBaseInfo('id')" class="max-w-xs" />
      </div>
      <div class="space-y-1.5">
        <Label class="text-sm font-medium">名称</Label>
        <Input v-model="elementBaseInfo.name" @change="updateBaseInfo('name')" class="max-w-xs" />
      </div>
    </div> -->
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, watch, onBeforeUnmount } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

defineOptions({ name: 'ElementBaseInfo' })

const props = defineProps({
  businessObject: {
    type: Object,
    default: () => { }
  },
  model: {
    type: Object,
    default: () => { }
  }
})
const needProps = ref<any>({})
const bpmnElement = ref()
const elementBaseInfo = ref<any>({})

const bpmnInstances = () => (window as any)?.bpmnInstances
const resetBaseInfo = () => {
  console.log(window, 'window')
  console.log(bpmnElement.value, 'bpmnElement')

  bpmnElement.value = bpmnInstances()?.bpmnElement
  elementBaseInfo.value = bpmnElement.value.businessObject
  needProps.value['type'] = bpmnElement.value.businessObject.$type
}


const handleKeyUpdate = (value: string) => {
  // 校验 value 的值，只有 XML NCName 通过的情况下，才进行赋值。否则，会导致流程图报错，无法绘制的问题
  if (!value) {
    return
  }
  if (!value.match(/[a-zA-Z_][\-_.0-9a-zA-Z$]*/)) {
    console.log('key 不满足 XML NCName 规则，所以不进行赋值')
    return
  }
  console.log('key 满足 XML NCName 规则，所以进行赋值')

  // 在 BPMN 的 XML 中，流程标识 key，其实对应的是 id 节点
  elementBaseInfo.value['id'] = value

  setTimeout(() => {
    updateBaseInfo('id')
  }, 100)
}

const handleNameUpdate = (value: string) => {
  console.log(elementBaseInfo, 'elementBaseInfo')
  if (!value) {
    return
  }
  elementBaseInfo.value['name'] = value

  setTimeout(() => {
    updateBaseInfo('name')
  }, 100)
}

const updateBaseInfo = (key: string) => {
  console.log(key, 'key')
  // 触发 elementBaseInfo 对应的字段
  const attrObj = Object.create(null)
  attrObj[key] = elementBaseInfo.value[key]

  needProps.value = { ...elementBaseInfo.value, ...needProps.value }

  if (key === 'id') {
    // console.log('jinru')
    // console.log(window, 'window')
    // console.log(bpmnElement.value, 'bpmnElement')
    // console.log(toRaw(bpmnElement.value), 'bpmnElement')

    bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), {
      id: elementBaseInfo.value[key],
      di: { id: `${elementBaseInfo.value[key]}_di` }
    })
  } else {
    // console.log(attrObj, 'attrObj')

    bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), attrObj)
  }
}



watch(
  () => props.businessObject,
  (val) => {
    console.log(props.businessObject);

    if (val) {
      // nextTick(() => {
      resetBaseInfo()
      // })
    }
  }
)

watch(
  () => props.model?.key,
  (val) => {
    console.log(props.model?.key);

    // 针对上传的 bpmn 流程图时，保证 key 和 name 的更新
    if (val) {
      handleKeyUpdate(props.model.key)
      handleNameUpdate(props.model.name)
    }
  },
  {
    immediate: true
  }
)

onBeforeUnmount(() => {
  bpmnElement.value = null
})
</script>