<script lang="ts" setup>
import { Icon } from '@/components/chronos-ui/Icon';
import { useDataTable } from '@/components/chronos-ui/table/use-data-table';
import { Button } from '@/components/ui/button';
import memberLevelColumns from './components/member-level-columns';
import { MemberLevelApi } from '@/common/api/member/level';
import MemberLevelTable from './components/member-level-table.vue';

const queryParams = reactive({
    name: null,
    status: null
})
const list = ref<any[]>([])

const table = useDataTable({
    columns: memberLevelColumns(),
    data: () => list.value, // Pass a function that returns the current data
    getSubRows: (row) => row.children,
});

/** 查询列表 */
const getList = async () => {
    try {

        const data = await MemberLevelApi.getLevelList(queryParams)
        list.value = data

    } catch (error) {
        console.error('Error fetching menu list:', error);
    }
}

onMounted(() => {
    getList()
})

console.log(table)


</script>

<template>
    <div class="flex justify-end pb-4">
        <router-link :to="'/member/level/form'">
            <Button variant="outline">
                <Icon icon="foller" />
                <p>新 增</p>
            </Button>
        </router-link>
    </div>
    <MemberLevelTable :table="table" :columns="memberLevelColumns()" />


</template>