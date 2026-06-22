<script setup lang="ts">
import { DictDataApi } from '@/common/api/system/dict/dictData'
import { useDataTable } from '@/components/chronos-ui/table/use-data-table'
import dictDataColumns from './components/dict-data-columns'
import DictDataTable from './components/dict-data-table.vue'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/chronos-ui/Icon'
import DictDataForm from '../components/dict-data-form.vue'


defineOptions({ name: 'SystemDictData' })

const props = defineProps({
    type: {
        type: String,
        default: ''
    }
})

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
    pageNo: 1,
    pageSize: 10,
    name: '',
    status: undefined,
    dictType: ''
})


// /** 查询列表 */
const getList = async () => {
    loading.value = true
    try {
        const data = await DictDataApi.getDictDataPage(queryParams)
        list.value = data.list
        total.value = data.total
    } finally {
        loading.value = false
    }
}


/** 添加/修改操作 */
const dictDataFormRef = ref()
const openDataForm = (type: string, id?: string) => {
    dictDataFormRef.value.openDataForm(type, id)
}

// Call useDataTable at the top level
const table = useDataTable({
    columns: dictDataColumns(openDataForm),
    data: () => list.value, // Pass a function that returns the current data
    getSubRows: (row) => row.children,
});



/** 监听type变化，自动重新加载数据 */
watch(() => props.type, (newType) => {
    queryParams.dictType = newType
    getList()
})


</script>

<template>
    <div class="table-head">
        <div></div>
        <div>
            <Button variant="outline" @click="openDataForm('create')">
                <Icon icon="foller" />
                <p>新 增</p>
            </Button>
        </div>
    </div>
    <DictDataTable :table="table" :columns="dictDataColumns(openDataForm)" />

    <DictDataForm ref="dictDataFormRef" :dict-type="props.type" @success="getList" />

</template>

<style scoped lang="scss">
.table-head {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}
</style>