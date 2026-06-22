<script lang="ts" setup>
// import CategoryDraggableModel from './CategoryDraggableModel.vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/chronos-ui/Icon'

defineOptions({ name: 'BpmModel' })

const { push } = useRouter()
const loading = ref(true) // 列表的加载中
const isCategorySorting = ref(false) // 是否 category 正处于排序状态
const queryParams = reactive({
  name: undefined
})
const queryFormRef = ref() // 搜索的表单
const categoryGroup: any = ref([]) // 按照 category 分组的数据
const originalData: any = ref([]) // 原始数据


/** 添加/修改操作 */
const openForm = (type: string, id?: string) => {
  if (type === 'create') {
    push({ name: 'WorkflowModelCreate' })
  } else {

  }
}


</script>


<template>
  <Card>
    <div class="flex justify-between pl-5 items-center">
      <h3 class="font-extrabold">流程模型</h3>
      <!-- 搜索工作栏 -->

      <!-- 右上角：新建模型、更多操作 -->
      <Button type="primary" @click="openForm('create')" class="ml-3">
        <Icon icon="foller" class="mr-1" /> 新建模型
      </Button>


    </div>

    <Separator class="my-2" />

  </Card>


</template>
