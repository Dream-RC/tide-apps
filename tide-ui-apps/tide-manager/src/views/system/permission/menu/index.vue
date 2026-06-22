<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { useDataTable } from "@/components/chronos-ui/table/use-data-table";

import { menuColumns } from "./components/menu-columns";
import { projectMenuColumns } from './components/project-menu-columns';

import { MenuApi } from "@/common/api/system/permission/menu";
import { ProjectMenuApi } from '@/common/api/pms/permission/menu';

import { handleTree } from "@/common/utils/tree";

import MenuTable from "./components/menu-table.vue";
import ProjectMenuTable from './components/project-menu-table.vue';

import { Card } from '@/components/ui/card';
import MenuForm from './components/menu-form.vue';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Icon } from '@/components/chronos-ui/Icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


defineOptions({ name: 'SystemMenu' })

const list = ref<any[]>([])
const projectMenuList = ref<any[]>([])

const queryParams = reactive({
    name: undefined,
    status: undefined
})

const projectQueryParams = reactive({
    name: undefined,
    status: undefined
})

/** 添加/修改操作 */
const menuFormRef = ref()

const openForm = (type: string, id?: string) => {
    menuFormRef.value.open(type, id)
}

// Call useDataTable at the top level
const table = useDataTable({
    columns: menuColumns(openForm),
    data: () => list.value, // Pass a function that returns the current data
    getSubRows: (row) => row.children,
});

const projectTable = useDataTable({
    columns: projectMenuColumns(),
    data: () => projectMenuList.value, // Pass a function that returns the current data
    getSubRows: (row) => row.children,
});

// 当前激活的标签
const activeTab = ref('platform-menu');


/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调


/** 查询列表 */
const getList = async () => {
    try {

        const data = await MenuApi.getMenuList(queryParams)

        const projectData = await ProjectMenuApi.getMenuList(projectQueryParams)

        list.value = handleTree(data)

        projectMenuList.value = handleTree(projectData)

    } catch (error) {
        console.error('Error fetching menu list:', error);
    }
}

onMounted(() => {
    getList()
})
</script>

<template>


    <Tabs default-value="platform-menu" class="w-full flex-col justify-start gap-6 pt-6">


        <div class="flex items-center justify-between px-4 lg:px-6">

            <TabsList>
                <TabsTrigger value="platform-menu" @click="activeTab = 'platform-menu'">
                    平台菜单
                </TabsTrigger>
                <TabsTrigger value="project-menu" @click="activeTab = 'project-menu'">
                    项目菜单
                </TabsTrigger>
            </TabsList>

            <div class="flex items-center gap-3">
                <Input type="search" v-if="activeTab === 'platform-menu'" placeholder="输入平台菜单名称..." />
                <Input type="search" v-if="activeTab === 'project-menu'" placeholder="输入项目菜单名称..." />


                <Button v-if="activeTab === 'platform-menu'" variant="outline" @click="openForm('create')">
                    <Icon icon="foller" />
                    <p>平台</p>
                </Button>

                <Button v-if="activeTab === 'project-menu'" variant="outline" @click="openForm('create')">
                    <Icon icon="foller" />
                    <p>项目</p>
                </Button>
            </div>

        </div>


        <TabsContent value="platform-menu">
            <MenuTable :table="table" :columns="menuColumns(openForm)" />
        </TabsContent>

        <TabsContent value="project-menu">
            <div class="w-full h-full">
                <ProjectMenuTable :table="projectTable" :columns="projectMenuColumns()" />
            </div>
        </TabsContent>
    </Tabs>

    <MenuForm ref="menuFormRef" @success="getList" />



</template>

<style lang="scss">

</style>