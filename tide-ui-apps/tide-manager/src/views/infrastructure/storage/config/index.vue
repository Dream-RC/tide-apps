<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StorageConfigForm from './components/storage-config-form.vue';
import StorageConfigTable from './components/storage-config-table.vue';
import { useDataTable } from '@/components/chronos-ui/table/use-data-table';
import storageConfigColumns from './components/storage-config-columns';
import { StorageConfigApi } from '@/common/api/infrastructure/storage/config';


defineOptions({ name: 'StorageConfig' })

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据

const queryParams = reactive({
    pageNo: 1,
    pageSize: 10,
    name: undefined,
    key: undefined,
    type: undefined,
    createTime: []
})


/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: string) => {
    formRef.value.open(type, id)
}


// Call useDataTable at the top level
const table = useDataTable({
    columns: storageConfigColumns(openForm),
    data: () => list.value, // Pass a function that returns the current data
    getSubRows: (row) => row.children,
});



/** 查询列表 */
const getList = async () => {
    loading.value = true
    try {
        const data = await StorageConfigApi.getStorageConfigPage(queryParams)
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

    <Card class="mb-4">
        <Button @click="openForm('create')" class="w-[80px]">新增</Button>
    </Card>

    <StorageConfigTable :table="table" :columns="storageConfigColumns(openForm)" />

    <StorageConfigForm ref="formRef" />

</template>


<style lang="scss" scoped></style>