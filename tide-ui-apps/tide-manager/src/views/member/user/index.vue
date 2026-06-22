<script lang="ts" setup>
import { useDataTable } from '@/components/chronos-ui/table/use-data-table';
import MemberUserTable from './components/member-user-table.vue';
import memberUserColumns from './components/member-user-columns';
import { MemberUserApi } from '@/common/api/member/user';

const queryParams = reactive({
    pageNo: 1,
    pageSize: 10,
    // nickname: null,
    // mobile: null,
    // loginDate: [],
    // createTime: [],
    // tagIds: [],
    // levelId: null,
    // groupId: null
})


const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据

const memberUserTable = useDataTable({
    columns: memberUserColumns(),
    data: () => list.value, // Pass a function that returns the current data
    getSubRows: (row) => row.children,
});


/** 查询列表 */
const getList = async () => {

    try {
        const data = await MemberUserApi.getUserPage(queryParams);
        list.value = data.list
        total.value = data.total
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    getList()
})



</script>

<template>

    <MemberUserTable :table="memberUserTable" :columns="memberUserColumns()" />


</template>