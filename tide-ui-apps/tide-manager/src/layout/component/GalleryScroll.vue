<script setup lang="ts">
import { computed } from "vue";
import { useSidebar } from "@/components/ui/sidebar";
import AppView from "./AppView.vue";
import NavTop from "./nav/NavTop.vue";

const props = defineProps<{
    hasMenu: boolean;
}>();

const { open } = useSidebar();

const sidebarLeft = computed(() => {
    if (!props.hasMenu) return "0";
    return open.value ? "16rem" : "0";
});
</script>

<template>
    <section class="smooth-wrapper" :style="{ left: sidebarLeft }">
        <div class="smooth-content">
            <div class="gallery-scroll">
                <NavTop />
                <AppView class="pl-6 pr-6" />
            </div>
        </div>
    </section>
</template>