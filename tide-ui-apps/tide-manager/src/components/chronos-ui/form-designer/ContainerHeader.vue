<script setup lang="ts">
import { useFormDesignerStore } from '@/store/modules/formDesigner';
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/chronos-ui/Icon'
import { computed } from 'vue'

interface Props {
  componentId: string
  label: string
  showDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDelete: true
})

const formDesignerStore = useFormDesignerStore()
const isSelected = computed(() => formDesignerStore.selectedComponentId === props.componentId)

const emit = defineEmits<{
  select: [componentId: string, event?: Event]
  delete: [componentId: string, event: Event]
}>()

const handleSelect = (event?: Event) => {
  event?.stopPropagation()
  emit('select', props.componentId, event)
}

const handleDelete = (event: Event) => {
  event.stopPropagation()
  emit('delete', props.componentId, event)
}
</script>

<template>
  <div class="container-header">
    <span class="container-label">{{ label }}</span>
    <Button v-if="showDelete && isSelected" size="icon" variant="destructive" class="delete-btn w-8 h-8"
      @click.stop="handleDelete">
      <Icon icon="fuzhi-F" />
    </Button>
  </div>
</template>

<style scoped>
.container-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  /* background: var(--card); */
  /* border-bottom: 1px solid var(--border-0); */
  border-radius: 4px 4px 0 0;
}

.container-label {
  font-size: 13px;
  font-weight: 500;
  /* color: var(--text-primary, #1f2937); */
}

.delete-btn {
  opacity: 0.8;
  padding: 4px;
}

.delete-btn:hover {
  opacity: 1;
}
</style>
