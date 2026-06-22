<script lang="ts" setup>
import { CategoryVO, WorkFlowCategoryApi } from '@/common/api/workflow/category'
import DataFormTable from '@/components/chronos-ui/table/data-form-table.vue'
import { useDataTable } from '@/components/chronos-ui/table/use-data-table'
import workflowCategoryColumns from './components/workflow-category-columns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/chronos-ui/Icon'
import WorkflowCategoryForm from './components/workflow-category-form.vue'

const loading = ref(true) // 列表的加载中
const list = ref<CategoryVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
    pageNo: 1,
    pageSize: 10,
    name: undefined,
    code: undefined,
    status: undefined,
    createTime: []
})

/** 添加/修改操作 */
const categoryFormRef = ref()

const openCategoryForm = (type: string, id?: string) => {
    categoryFormRef.value.openCategoryForm(type, id)
}

const table = useDataTable({
    columns: workflowCategoryColumns(openCategoryForm),
    data: () => list.value, // Pass a function that returns the current data
    getSubRows: (row) => row.children,
});


// /** 查询列表 */
const getList = async () => {
    loading.value = true
    try {
        const data = await WorkFlowCategoryApi.getCategoryPage(queryParams)
        list.value = data.list
        total.value = data.total
    } finally {
        loading.value = false
    }
}

/** 初始化 **/
onMounted(() => {
    getList()
})


</script>

<template>

    <Card class="p-4 bg-background">
        <div class="flex justify-between items-center">
            <h3 class="font-extrabold">流程分类</h3>

            <Button @click="openCategoryForm('create')">
                <Icon icon="foller" />新增分类
            </Button>
        </div>
    </Card>

    <DataFormTable :table="table" :columns="workflowCategoryColumns(openCategoryForm)" />

    <WorkflowCategoryForm @success="getList" ref="categoryFormRef" />
</template>

<style lang="scss" scoped></style>