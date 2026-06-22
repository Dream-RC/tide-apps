<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { DictTypeApi } from '@/common/api/system/dict/dictType'
import { AccordionContent, AccordionItem, AccordionTrigger, Accordion } from '@/components/ui/accordion'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Plus } from 'lucide-vue-next'
import { AccordionHeader } from 'reka-ui'
import { formatBaseDate, formatDate } from '@/common/utils/formatTime'
import { Icon } from '@/components/chronos-ui/Icon'
import { Button } from '@/components/ui/button'
import SystemDictData from './data/index.vue'
import DictTypeForm from './components/dict-type-form.vue'
import DataTablePagination from '@/components/chronos-ui/pagination/src/DataTablePagination.vue'

const loading = ref(true) // 列表的加载中
const list = ref([]) // 列表的数据
const searchQuery = ref('') // 搜索关键词
const selectedType = ref('') // 当前选中的字典类型

defineOptions({ name: 'DictType' })

const dictTypeQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  status: undefined
})

const total = ref(0) // 列表的总页数

/** 查询字典类型列表 */
const getDictTypeList = async () => {
  loading.value = true
  try {
    const data = await DictTypeApi.getPage(dictTypeQueryParams)
    list.value = data.list || []
    total.value = data.total || 0

    // 设置默认值：选中第一个字典类型
    if (list.value.length > 0 && !selectedType.value) {
      selectedType.value = list.value[0].type
      console.log('默认选中:', selectedType.value)
    }
  } finally {
    loading.value = false
  }
}


/** 添加/修改操作 */
const dictTypeFormRef = ref()
const openForm = (type: string, id?: number) => {
  dictTypeFormRef.value.open(type, id)
}


/** 初始化 **/
onMounted(() => {
  getDictTypeList()
})

/** 分页切换 */
const handlePageChange = (page: number) => {
  dictTypeQueryParams.pageNo = page
  getDictTypeList()
}

/** 点击Accordion时设置type */
const setSelectedType = (type: string) => {
  selectedType.value = type
  console.log('selected type:', type)
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

</script>

<template>
  <div class="flex flex-row gap-4">
    <Card class="dict-type-card bg-background">
      <!-- 头部 - 固定 -->
      <CardHeader class="dict-header">
        <h2 class="text-lg font-bold text-foreground">字典类型</h2>
        <Button variant="outline" @click="openForm('create')">
          <Icon icon="foller" />
          <p>新 增</p>
        </Button>

      </CardHeader>
      <!-- 中间内容区 - 可滚动 -->
      <CardContent class="dict-content">
        <Accordion default-value="3" type="single" collapsible class="w-full space-y-2">
          <AccordionItem v-for="item in list" :key="item.id" :value="item.id"
            class="rounded-lg border bg-background py-1">

            <AccordionHeader class="">
              <AccordionTrigger class="" @click="setSelectedType(item.type)">
                <span class="flex-1">
                  {{ item.name }}
                  <!-- flex-row flex-between gap-between-2  -->
                  <div class="flex  flex-row justify-between pt-2 ">

                    <div class="flex flex-row  gap-2 items-center">
                      <Icon icon="zhuangtai" :size="16" color="B3B4B6" />
                      <p class="font-sm text-muted-foreground"> {{ item.type }}</p>
                    </div>

                    <div class="flex flex-row gap-2 items-center">
                      <Icon icon="shijian" :size="16" color="B3B4B6" />
                      <p class="font-sm text-muted-foreground"> {{ formatBaseDate(new Date(item.createTime)) }}
                      </p>
                    </div>

                  </div>
                </span>

                <template #icon>
                  <Plus :size="16" :stroke-width="2" class="shrink-0 opacity-60 transition-transform duration-200"
                    aria-hidden="true" />
                </template>
              </AccordionTrigger>
            </AccordionHeader>

            <AccordionContent class="flex flex-col gap-3 pb-2 text-muted-foreground">
              <!-- bg-background -->

              <div class="flex flex-col gap-2">
                <p>描述：</p>
                <p class="dict-card-font text-wrap break-all font-mono text-sm text-muted-foreground indent-5">
                  {{ item.description }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <Button variant="outline" @click="openForm('update', item.id)">编辑</Button>
                <Button variant="outline">删除</Button>
              </div>


            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </CardContent>

      <!-- 底部 - 固定（分页预留） -->
      <CardFooter class="dict-footer">
        <DataTablePagination :pagination="{
          pageNo: dictTypeQueryParams.pageNo,
          pageSize: dictTypeQueryParams.pageSize,
          total: total
        }" :on-page-change="handlePageChange" @change="handlePageChange" />
      </CardFooter>
    </Card>

    <Card class="dict-data-card bg-background p-5">
      <SystemDictData :type="selectedType" />
    </Card>
  </div>

  <DictTypeForm ref="dictTypeFormRef" @success="getDictTypeList" />

</template>

<style scoped lang="scss">
.dict-type-card {
  width: 320px;
  height: calc(100vh - 70px);
  // position: fixed;
  // display: flex;
  // flex-direction: column;
  // overflow: hidden;
  // background: var(--background);
}

.dict-data-card {
  width: 100%;
  height: calc(100vh - 70px);
}

.dict-card-font {
  font-size: 12px;
}

.font-sm {
  font-size: 9px;
}

.dict-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

// .dict-header h2 {
//   margin: 0;
// }

.dict-content {
  flex: 1;
  overflow-y: auto;
}

.dict-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  // flex-shrink: 0;
  // padding: 12px 16px;
  // border-top: 1px solid var(--border-color);
  // background: var(--background);
}

/* 隐藏滚动条但保持滚动功能 */
.dict-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}
</style>