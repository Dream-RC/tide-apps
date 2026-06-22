<script setup lang="ts">
import { useDataTable } from '@/components/chronos-ui/table/use-data-table.ts';
import roleColumns from './components/role-columns.jsx';
import RoleTable from './components/role-table.vue';
import { RoleApi, Role } from '@/common/api/system/permission/role/index.ts';
import RoleAssignMenuForm from './components/RoleAssignMenuForm.vue';

const queryParams = reactive({
    pageNo: 1,
    pageSize: 10,
})

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据


/** 菜单权限操作 */
const assignMenuFormRef = ref()
const openAssignMenuForm = async (row: Role) => {
    assignMenuFormRef.value.open(row)
}


/** 查询列表 */
const getList = async () => {

    try {
        const data = await RoleApi.getPage(queryParams);
        list.value = data.list
        total.value = data.total
    } finally {
        loading.value = false
    }
}

const roleTable = useDataTable({
    columns: roleColumns(undefined, openAssignMenuForm),
    data: () => list.value, // Pass a function that returns the current data
    // getSubRows: (row) => row.children,
});

onMounted(() => {
    getList()
})

</script>

<template>
    <RoleTable :table="roleTable" :columns="roleColumns(undefined, openAssignMenuForm)" />

    <RoleAssignMenuForm ref="assignMenuFormRef" />
    
</template>