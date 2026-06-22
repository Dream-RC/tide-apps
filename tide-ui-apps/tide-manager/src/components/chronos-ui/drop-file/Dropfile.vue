<script setup lang="ts">
import { useDropZone, useFileDialog } from "@vueuse/core";
import { normalizeClass } from "vue";
import type { HTMLAttributes } from "vue";
import { Icon } from "../Icon";

const props = withDefaults(
    defineProps<{
        /**
         * The text to display as the title of the dropzone.
         *
         * @default "Click to upload or drag & drop files."
         */
        title?: string;
        /**
         * The text to display as the subtext of the dropzone.
         *
         * @default "All file types accepted"
         */
        subtext?: string;
        /**
         * The icon to display in the dropzone.
         *
         * @default "lucide:cloud-upload"
         */
        icon?: string;
        /** The function to call when files are dropped. */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        onDrop?: Function;
        /**
         * Whether or not to allow multiple files to be picked. Does not affect drag and drop.
         *
         * @default true
         */
        multiple?: boolean;
        /**
         * The file types to accept. Does not affect drag and drop.
         *
         * @default "*"
         */
        accept?: string;
        /** Any additional class that should be added to the dropzone. */
        class?: HTMLAttributes["class"];
    }>(),
    {
        title: "Click to upload or drag & drop files.",
        subtext: "All file types accepted",
        icon: "lucide:cloud-upload",
        multiple: true,
        accept: "*",
    }
);

const { open, reset, onChange } = useFileDialog({
    multiple: props.multiple,
    accept: props.accept,
});

onChange((files: FileList | null) => {
    if (files?.length) {
        handleDrop(Array.from(files || []));
        reset();
    }
});

const dropZoneRef = useTemplateRef("dropZoneRef");
const emits = defineEmits<{
    dropped: [any];
}>();

const handleDrop = (files: File[] | null) => {
    if (!files) return;
    if (props.onDrop) props.onDrop(files);
    emits("dropped", files);
};

const { isOverDropZone } = useDropZone(dropZoneRef, handleDrop);

//   const styles = tv({
//     base: "hover:border-primary flex w-full cursor-pointer items-center justify-center rounded-md border border-dashed transition",
//     variants: {
//       isOverDropZone: { true: "border-primary bg-primary/10" },
//     },
//   });

defineExpose({ dropZoneRef });
</script>

<template>
    <!-- :class="styles({ isOverDropZone, class: normalizeClass(props.class) || undefined })" -->

    <div ref="dropZoneRef" data-slot="dropfile" @click="open()" :class="[
        isOverDropZone ? 'border-primary bg-primary/10' : '',
        props.class
    ]">
        <slot>
            <slot name="message">
                <div data-slot="dropfile-message" class="py-10 text-center">
                    <slot name="title">
                        <p v-if="title" data-slot="dropfile-title" class="mt-5 text-sm font-medium" v-html="title" />
                    </slot>
                    <slot name="subtext">
                        <p v-if="subtext" data-slot="dropfile-subtext" class="text-muted-foreground/60 mt-1 text-sm"
                            v-html="subtext" />
                    </slot>
                </div>
            </slot>
        </slot>
    </div>
</template>
