<script setup lang="ts">
import type { HTMLAttributes, PropType } from "vue"
import { cn } from "@/lib/utils"

interface AlertProps extends HTMLAttributes {
  variant?: "default" | "destructive"
}

const props = withDefaults(defineProps<AlertProps>(), {
  variant: "default",
})
</script>

<template>
  <div
    class="flex items-center gap-2 rounded-md border p-4"
    :class="{
      'border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900': props.variant === 'default',
      'border-destructive/50 bg-destructive/10 dark:border-destructive dark:bg-destructive/20': props.variant === 'destructive',
    }"
  >
    <slot />
  </div>
</template>