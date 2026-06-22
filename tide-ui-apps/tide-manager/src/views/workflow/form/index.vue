<script setup lang="ts">
import { Icon } from '@/components/chronos-ui/Icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import workflowFormColumns from './components/workflow-form-columns';
import { useDataTable } from '@/components/chronos-ui/table/use-data-table';
import { WorkFlowFormApi } from '@/common/api/workflow/form';
import WorkflowFormTable from './components/workflow-form-table.vue';

defineOptions({
    name: 'WorkFlowForm',
})

const { currentRoute, push } = useRouter() // 路由

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据

const queryParams = reactive({
    pageNo: 1,
    pageSize: 10,
    name: null
})

/** 添加/修改操作 */
const openForm = (type: string, id?: number) => {
    const toRouter: { name: string; query: { type: string; id?: number } } = {
        name: 'WorkflowFormEditor',
        query: {
            type
        }
    }
    console.log(typeof id)
    // 表单新建的时候id传的是event需要排除
    if (typeof id === 'number' || typeof id === 'string') {
        toRouter.query.id = id
    }
    push(toRouter)
}


// Call useDataTable at the top level
const table = useDataTable({
    columns: workflowFormColumns(openForm),
    data: () => list.value, // Pass a function that returns the current data
    getSubRows: (row) => row.children,
});


// /** 查询列表 */
const getList = async () => {
    loading.value = true
    try {
        const data = await WorkFlowFormApi.getFormPage(queryParams)
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
            <h3 class="font-extrabold">流程表单</h3>

            <Button @click="openForm('create')">
                <Icon icon="foller" />新增表单
            </Button>
        </div>
    </Card>

    <WorkflowFormTable :table="table" :columns="workflowFormColumns(openForm)" />


</template>