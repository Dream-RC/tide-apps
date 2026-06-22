<script setup lang="ts">
import { UserApi, type UserVo } from '@/common/api/system/permission/user';
import { useDataTable } from '@/components/chronos-ui/table/use-data-table';
import userColumns from './components/user-columns';
import UserTable from './components/user-table.vue';
import { Icon } from '@/components/chronos-ui/Icon';
import Button from '@/components/ui/button/Button.vue';
import { Input } from '@/components/ui/input/index.ts';
import UserForm from './components/user-form.vue';
import UserAssignRoleForm from './components/user-assign-role-form.vue';

const queryParams = reactive({
    pageNo: 1,
    pageSize: 10,
})

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: string) => {
    formRef.value.open(type, id)
}

/** 分配角色 */
const assignRoleFormRef = ref()
const handleRole = (row: UserVo) => {
    assignRoleFormRef.value.open(row)
}


/** 查询列表 */
const getList = async () => {

    try {
        const data = await UserApi.getUserPage(queryParams);
        list.value = data.list
        total.value = data.total
    } finally {
        loading.value = false
    }
}

const columns = userColumns(openForm, handleRole)

const userTable = useDataTable({
    columns,
    data: () => list.value,
});

onMounted(() => {
    getList()
})

</script>

<template>


    <div class="flex items-center justify-between px-4 lg:px-6 pb-5">
        <div></div>

        <div class="flex items-center gap-3">
            <Input type="search" placeholder="输入用户名称..." />

            <Button variant="outline" @click="openForm('create')">
                <Icon icon="foller" />
                <p>平台</p>
            </Button>
        </div>

    </div>


    <UserTable :table="userTable" :columns="columns" />
    <!-- 添加或修改用户对话框 -->
    <UserForm ref="formRef" @success="getList" />
    <UserAssignRoleForm ref="assignRoleFormRef" @success="getList" />


</template>