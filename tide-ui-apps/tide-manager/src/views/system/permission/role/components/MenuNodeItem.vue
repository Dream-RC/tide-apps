<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox';

defineOptions({ name: 'MenuNodeItem' })

const props = defineProps<{
    node: any
    depth: number
    isChecked: (id: string) => boolean
    isHalfChecked: (id: string) => boolean
    toggleCheck: (id: string) => void
}>()

const hasChildren = (n: any) => n.children && n.children.length > 0

const leafChildren = computed(() =>
    props.node.children?.filter((c: any) => !hasChildren(c)) || []
)

const nonLeafChildren = computed(() =>
    props.node.children?.filter((c: any) => hasChildren(c)) || []
)
</script>

<template>
    <div class="space-y-1">
        <!-- 非叶子节点：行内展示 -->
        <div v-if="hasChildren(node)"
            class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent/50 transition-colors"
            :style="{ marginLeft: `${depth * 1.5}rem` }">
            <Checkbox :model-value="isChecked(node.id)" :indeterminate="isHalfChecked(node.id)"
                @update:model-value="toggleCheck(node.id)" />
            <span class="text-sm font-medium cursor-pointer flex-1 truncate" @click="toggleCheck(node.id)">
                {{ node.name }}
            </span>
        </div>

        <!-- 叶子子节点：flex 平铺 -->
        <div v-if="leafChildren.length > 0" class="flex flex-wrap gap-2"
            :style="{ marginLeft: `${(depth + 1) * 1.5}rem` }">
            <div v-for="leaf in leafChildren" :key="leaf.id"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-background hover:bg-accent/50 transition-colors cursor-pointer select-none"
                @click="toggleCheck(leaf.id)">
                <Checkbox :model-value="isChecked(leaf.id)" @click.stop
                    @update:model-value="toggleCheck(leaf.id)" />
                <span class="text-sm whitespace-nowrap">{{ leaf.name }}</span>
            </div>
        </div>

        <!-- 非叶子子节点：递归 -->
        <MenuNodeItem v-for="child in nonLeafChildren" :key="child.id" :node="child" :depth="depth + 1"
            :isChecked="isChecked" :isHalfChecked="isHalfChecked" :toggleCheck="toggleCheck" />
    </div>
</template>