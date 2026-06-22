<script setup lang="ts">
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { UserVo } from '@/common/api/system/permission/user';
import type { Role } from '@/common/api/system/permission/role';
import { RoleApi } from '@/common/api/system/permission/role';
import { PermissionApi } from '@/common/api/system/permission';

defineOptions({ name: 'UserAssignRoleForm' })

const emit = defineEmits<{
    success: []
}>()

const formLoading = ref(false)
const dialogVisible = ref(false)
const user = ref<UserVo>()
const roleList = ref<Role[]>([])
const checkedIds = ref<Set<string>>(new Set())

const isAllChecked = computed(() => {
    return roleList.value.length > 0 && checkedIds.value.size >= roleList.value.length
})

const isIndeterminate = computed(() => {
    return checkedIds.value.size > 0 && checkedIds.value.size < roleList.value.length
})

const handleToggleAll = () => {
    if (isAllChecked.value) {
        checkedIds.value = new Set()
    } else {
        checkedIds.value = new Set(roleList.value.map((r) => r.id))
    }
}

const open = async (row: UserVo) => {
    dialogVisible.value = true
    user.value = row
    formLoading.value = true

    try {
        roleList.value = await RoleApi.getSimpleRoleList()

        const userRoleIds = await PermissionApi.getUserRoleList(row.id)
        checkedIds.value = new Set<string>(userRoleIds)
    } finally {
        formLoading.value = false
    }
}

const handleSubmit = async () => {
    if (!user.value) return
    formLoading.value = true
    try {
        await PermissionApi.assignUserRole({
            userId: user.value.id,
            roleIds: Array.from(checkedIds.value),
        })
        dialogVisible.value = false
        emit('success')
    } finally {
        formLoading.value = false
    }
}

defineExpose({ open })
</script>

<template>
    <Dialog :open="dialogVisible" @update:open="(val: boolean) => dialogVisible = val">
        <DialogContent class="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>分配角色</DialogTitle>
            </DialogHeader>

            <div class="py-4">
                <div class="flex items-center gap-2 pb-3 border-b">
                    <span class="text-sm text-muted-foreground">用户：</span>
                    <span class="text-sm font-semibold">{{ user?.nickname || user?.username }}</span>
                </div>

                <div class="flex items-center gap-2 py-3">
                    <Checkbox :model-value="isAllChecked" :indeterminate="isIndeterminate"
                        @update:model-value="handleToggleAll" />
                    <Label class="text-sm cursor-pointer" @click="handleToggleAll">全选/全不选</Label>
                </div>

                <div v-if="formLoading" class="flex items-center justify-center py-10">
                    <span class="text-muted-foreground">加载中...</span>
                </div>

                <div v-else class="flex flex-wrap gap-2">
                    <div v-for="role in roleList" :key="role.id"
                        class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-background hover:bg-accent/50 transition-colors cursor-pointer select-none"
                        @click="checkedIds.has(role.id)
                            ? checkedIds.delete(role.id)
                            : checkedIds.add(role.id)">
                        <Checkbox :model-value="checkedIds.has(role.id)" @click.stop
                            @update:model-value="checkedIds.has(role.id)
                                ? checkedIds.delete(role.id)
                                : checkedIds.add(role.id)" />
                        <span class="text-xs whitespace-nowrap">{{ role.name }}</span>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" @click="dialogVisible = false">取消</Button>
                <Button :disabled="formLoading" @click="handleSubmit">
                    {{ formLoading ? '保存中...' : '保存' }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>