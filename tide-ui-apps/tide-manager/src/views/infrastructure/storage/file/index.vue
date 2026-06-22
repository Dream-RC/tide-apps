<script setup lang="ts">
import { useDataTable } from '@/components/chronos-ui/table/use-data-table';
import { storageFileColumns } from './components/file-columns';
import { StorageFileApi } from '@/common/api/infrastructure/storage/file';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/chronos-ui/Icon';
import FileForm from './components/file-form.vue';
import StorageFileDataTable from './components/storage-file-data-table.vue';


defineOptions({ name: 'StorageFile' })

const loading = ref(true) // 列表的加载中
const list = ref<any[]>([])
const total = ref(0) // 列表的总页数

/** 添加/修改操作 */
const formRef = ref()
const openForm = () => {
    formRef.value.open()
}

const queryParams = reactive({
    pageNo: 1,
    pageSize: 10,
    name: undefined,
    type: undefined,
    path: undefined,
    createTime: []
})


// Call useDataTable at the top level
const table = useDataTable({
    columns: storageFileColumns(openForm),
    data: () => list.value, // Pass a function that returns the current data
    getSubRows: (row) => row.children,
});


/** 查询列表 */
const getList = async () => {
    loading.value = true
    try {
        const data = await StorageFileApi.getStorageFilePage(queryParams)
        list.value = data.list
        total.value = data.total

        console.log(data);

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

    <!-- <Card class="px-4"> -->
    <div class="flex justify-between items-center">
        <div class=""></div>
        <Button variant="outline" @click="openForm">
            <Icon icon="foller" />
            <p>上传文件</p>
        </Button>
    </div>
    <!-- </Card> -->

    <StorageFileDataTable :table="table" :columns="storageFileColumns(openForm)" />

    <FileForm ref="formRef" @success="getList"/>

</template>

<style lang="scss" scoped></style>