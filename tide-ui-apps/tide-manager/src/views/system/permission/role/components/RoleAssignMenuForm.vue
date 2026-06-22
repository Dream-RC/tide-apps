<script setup lang="ts">
import {
    Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Role } from '@/common/api/system/permission/role/index.ts';
import { handleTree } from '@/common/utils/tree';
import { MenuApi } from '@/common/api/system/permission/menu';
import { PermissionApi } from '@/common/api/system/permission';
import MenuNodeItem from './MenuNodeItem.vue';

defineOptions({
    name: "RoleAssignMenuForm",
})

const formLoading = ref(false)
const dialogVisible = ref(false)
const role = ref<Role>()
const menuOptions = ref<any[]>([])
const checkedKeys = ref<Set<string>>(new Set())
const halfCheckedKeys = ref<Set<string>>(new Set())

const allMenuIds = ref<Set<string>>(new Set())

const collectAllIds = (nodes: any[]) => {
    nodes.forEach((node) => {
        allMenuIds.value.add(node.id)
        if (node.children && node.children.length > 0) {
            collectAllIds(node.children)
        }
    })
}

const getCheckedAndHalfChecked = (nodes: any[], checked: Set<string>): { checked: Set<string>; half: Set<string> } => {
    const result = { checked: new Set<string>(), half: new Set<string>() }

    const dfs = (node: any): { allChecked: boolean; anyChecked: boolean } => {
        if (!node.children || node.children.length === 0) {
            const isChecked = checked.has(node.id)
            if (isChecked) result.checked.add(node.id)
            return { allChecked: isChecked, anyChecked: isChecked }
        }

        let allChildrenChecked = true
        let anyChildChecked = false

        for (const child of node.children) {
            const childResult = dfs(child)
            if (!childResult.allChecked) allChildrenChecked = false
            if (childResult.anyChecked) anyChildChecked = true
        }

        if (allChildrenChecked) {
            result.checked.add(node.id)
        } else if (anyChildChecked) {
            result.half.add(node.id)
        }

        return { allChecked: allChildrenChecked, anyChecked: anyChildChecked }
    }

    nodes.forEach((node) => dfs(node))
    return result
}

const toggleCheck = (nodeId: string) => {
    const newChecked = new Set(checkedKeys.value)

    const findNode = (nodes: any[], id: string): any | null => {
        for (const node of nodes) {
            if (node.id === id) return node
            if (node.children) {
                const found = findNode(node.children, id)
                if (found) return found
            }
        }
        return null
    }

    const collectDescendantIds = (node: any): string[] => {
        const ids = [node.id]
        if (node.children) {
            node.children.forEach((child: any) => {
                ids.push(...collectDescendantIds(child))
            })
        }
        return ids
    }

    const collectAncestorIds = (nodes: any[], targetId: string, ancestors: string[] = []): string[] | null => {
        for (const node of nodes) {
            if (node.id === targetId) return ancestors
            if (node.children) {
                const result = collectAncestorIds(node.children, targetId, [...ancestors, node.id])
                if (result) return result
            }
        }
        return null
    }

    const node = findNode(menuOptions.value, nodeId)
    if (!node) return

    const descendantIds = collectDescendantIds(node)

    if (newChecked.has(nodeId)) {
        descendantIds.forEach((id) => newChecked.delete(id))
    } else {
        descendantIds.forEach((id) => newChecked.add(id))
    }

    const ancestors = collectAncestorIds(menuOptions.value, nodeId)
    if (ancestors) {
        for (const ancestorId of ancestors.reverse()) {
            const ancestorNode = findNode(menuOptions.value, ancestorId)
            if (ancestorNode && ancestorNode.children) {
                const allChildrenChecked = ancestorNode.children.every((child: any) => {
                    const childDescendants = collectDescendantIds(child)
                    return childDescendants.every((id) => newChecked.has(id))
                })
                if (allChildrenChecked) {
                    newChecked.add(ancestorId)
                } else {
                    newChecked.delete(ancestorId)
                }
            }
        }
    }

    checkedKeys.value = newChecked
    const { half } = getCheckedAndHalfChecked(menuOptions.value, newChecked)
    halfCheckedKeys.value = half
}

const isChecked = (nodeId: string) => checkedKeys.value.has(nodeId)
const isHalfChecked = (nodeId: string) => halfCheckedKeys.value.has(nodeId)

const isAllChecked = computed(() => {
    return allMenuIds.value.size > 0 && checkedKeys.value.size >= allMenuIds.value.size
})

const isIndeterminate = computed(() => {
    return checkedKeys.value.size > 0 && checkedKeys.value.size < allMenuIds.value.size
})

const handleToggleAll = () => {
    if (isAllChecked.value) {
        checkedKeys.value = new Set()
        halfCheckedKeys.value = new Set()
    } else {
        checkedKeys.value = new Set(allMenuIds.value)
        halfCheckedKeys.value = new Set()
    }
}

const open = async (row: Role) => {
    dialogVisible.value = true
    role.value = row
    formLoading.value = true

    try {
        menuOptions.value = handleTree(await MenuApi.getSimpleMenusList())
        allMenuIds.value = new Set()
        collectAllIds(menuOptions.value)

        const roleMenuIds = await PermissionApi.getRoleMenuList(row.id)
        const checkedSet = new Set<string>(roleMenuIds)
        checkedKeys.value = checkedSet
        const { half } = getCheckedAndHalfChecked(menuOptions.value, checkedSet)
        halfCheckedKeys.value = half
    } finally {
        formLoading.value = false
    }
}

const collectAncestors = (nodes: any[], targetId: string, ancestors: string[] = []): string[] | null => {
    for (const node of nodes) {
        if (node.id === targetId) return ancestors
        if (node.children) {
            const result = collectAncestors(node.children, targetId, [...ancestors, node.id])
            if (result) return result
        }
    }
    return null
}

const handleSubmit = async () => {
    if (!role.value) return
    formLoading.value = true
    try {
        const ids = new Set(checkedKeys.value)

        for (const id of checkedKeys.value) {
            const ancestors = collectAncestors(menuOptions.value, id)
            if (ancestors) {
                ancestors.forEach((aid) => ids.add(aid))
            }
        }

        const menuIds = Array.from(ids)

        const data = {
            roleId: role.value.id,
            menuIds: menuIds
        }

        await PermissionApi.assignRoleMenu(data)

        dialogVisible.value = false
    } finally {
        formLoading.value = false
    }
}

defineExpose({ open })
</script>

<template>
    <Sheet :open="dialogVisible" @update:open="(val: boolean) => dialogVisible = val">
        <SheetContent style="width: 60%; max-width: 50%;" class="rounded-l-[20px] flex flex-col">
            <SheetHeader>
                <SheetTitle>菜单权限</SheetTitle>
            </SheetHeader>

            <div class="flex-1 overflow-y-auto no-scrollbar px-6">
                <div class="flex items-center justify-between py-3 border-b">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-muted-foreground">名称：</span>
                        <span class="text-sm font-semibold">{{ role?.name }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-muted-foreground">标识：</span>
                        <span class="text-sm font-semibold">{{ role?.code }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <Checkbox :model-value="isAllChecked" :indeterminate="isIndeterminate"
                            @update:model-value="handleToggleAll" />
                        <Label class="text-sm cursor-pointer" @click="handleToggleAll">全选/全不选</Label>
                    </div>
                </div>

                <div v-if="formLoading" class="flex items-center justify-center py-20">
                    <span class="text-muted-foreground">加载中...</span>
                </div>

                <div v-else class="py-3 space-y-1">
                    <MenuNodeItem v-for="node in menuOptions" :key="node.id" :node="node" :depth="0"
                        :isChecked="isChecked" :isHalfChecked="isHalfChecked" :toggleCheck="toggleCheck" />
                </div>
            </div>

            <SheetFooter class="px-6 py-4 border-t">
                <Button variant="outline" @click="dialogVisible = false">取消</Button>
                <Button :disabled="formLoading" @click="handleSubmit">
                    {{ formLoading ? '保存中...' : '保存' }}
                </Button>
            </SheetFooter>
        </SheetContent>
    </Sheet>
</template>