<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Dropfile from '@/components/chronos-ui/drop-file/Dropfile.vue';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/chronos-ui/Icon';
import { Progress } from '@/components/ui/progress';
import { uploadFiles } from '@/components/chronos-ui/drop-file/useUpload';
import { toast } from 'vue-sonner';
import { FileUploadStatus, formatFileSize, isImage } from '@/common/utils/file';

defineOptions({
    name: 'FileForm',
})

const dialogVisible = ref(false) // 弹窗的是否展示



const files = ref<FileUploadStatus[]>([]);
const uploading = ref(false);


const removeFile = (index: number) => {
    files.value.splice(index, 1);
};



// 安全创建对象URL
const createObjectURL = (file: File | undefined): string => {
    if (!file) return '';
    try {
        return (window.URL || window.webkitURL || window.mozURL || window.msURL).createObjectURL(file);
    } catch (e) {
        console.error('Failed to create object URL:', e);
        return '';
    }
};

// 获取所有图片文件
const imageFiles = computed(() => {
    return files.value.filter(fileStatus => isImage(fileStatus.file));
});

// 获取第一个非图片文件
const nonImageFiles = computed(() => {
    return files.value.filter(fileStatus => !isImage(fileStatus.file));
});

// 是否有图片文件
const hasImageFiles = computed(() => {
    return imageFiles.value.length > 0;
});

// 处理文件上传
const handleFileUpload = async () => {

    uploading.value = true;

    try {
        // 重置所有文件状态
        files.value.forEach(fileStatus => {
            fileStatus.status = 'pending';
            fileStatus.progress = 0;
        });

        // 准备上传的文件
        const uploadFilesList = files.value.map(file => file.file);

        // 执行上传
        await uploadFiles(uploadFilesList, {
            onProgress: (progress, file) => {
                const fileIndex = files.value.findIndex(f => f.file === file);
                if (fileIndex !== -1) {
                    files.value[fileIndex].progress = progress;
                    files.value[fileIndex].status = 'uploading';
                }
            },
            onSuccess: (result, file) => {
                const fileIndex = files.value.findIndex(f => f.file === file);
                if (fileIndex !== -1) {
                    files.value[fileIndex].status = 'success';
                    files.value[fileIndex].progress = 100;
                }
                toast.success(`${file.name} 上传成功`);
            },
            onError: (error, file) => {
                const fileIndex = files.value.findIndex(f => f.file === file);
                if (fileIndex !== -1) {
                    files.value[fileIndex].status = 'error';
                    files.value[fileIndex].error = error.message || '上传失败';
                }
                toast.error(`${file.name} 上传失败: ${error.message}`);
            }
        });

        toast.success('所有文件上传完成');
        // 上传完成后关闭弹窗
        setTimeout(() => {
            dialogVisible.value = false;
            files.value = [];
        }, 1000);

    } catch (error) {
        toast.error('上传过程中出现错误');
    } finally {
        uploading.value = false;
    }
};

// 处理文件选择（单个文件）
const handleFilesDropped = (newFiles: File[]) => {
    // 只取第一个文件，替换现有文件
    if (newFiles.length > 0) {
        const file = newFiles[0];
        files.value = [{
            file,
            progress: 0,
            status: 'pending'
        }];
    }
};

/** 打开弹窗 */
const open = async () => {
    dialogVisible.value = true;
    files.value = [];
    uploading.value = false;
}

defineExpose({ open });

</script>

<template>

    <Dialog :open="dialogVisible" @update:open="(val) => dialogVisible = val">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>上传文件</DialogTitle>
                <DialogDescription>
                </DialogDescription>
            </DialogHeader>

            <div class="mx-auto max-w-100">
                <Dropfile @dropped="handleFilesDropped" :multiple="false"
                    class="border-1 border-dashed border rounded-xl p-8">
                    <!-- 有图片文件时显示图片预览 -->
                    <template v-if="hasImageFiles" #title>
                        <div class="flex flex-col items-center justify-center min-h-[200px]">
                            <div
                                class="relative aspect-video w-full max-w-xs rounded-xl overflow-hidden bg-gray-800 shadow-lg hover:shadow-xl transition-shadow border-2 border-dashed border-white/30 hover:border-white/50 mx-auto">

                                <img v-if="imageFiles[0]?.file" :src="createObjectURL(imageFiles[0].file)"
                                    :alt="imageFiles[0].file?.name || ''" class="w-full h-full object-contain" />

                                <button @click.stop="files = []"
                                    class="absolute top-2 right-2 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center scale-80 text-white hover:bg-black/70 transition-all hover:scale-100">
                                 
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"
                                        aria-hidden="true">
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>

                                </button>
                                <!-- 文件信息覆盖层 -->
                                <div
                                    class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex flex-col items-center">
                                    <p class="text-white text-xs truncate max-w-[200px] text-center"
                                        :title="imageFiles[0].file?.name">{{ imageFiles[0].file?.name }}</p>
                                    <p class="text-gray-300 text-xs">{{ formatFileSize(imageFiles[0].file?.size || 0) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- 没有图片文件时显示上传提示 -->
                    <template v-else #title>
                        <div class="text-sm ">将文件拖到此处，或 点击上传</div>
                    </template>

                    <!-- 替换副标题 - 有图片时不显示 -->
                    <!-- <template v-if="!hasImageFiles" #subtext>
                        <p class="text-sm text-gray-400">支持 PNG、JPG、PDF 等文件</p>
                    </template> -->

                    <template #subtext>
                        <div class="text-sm"></div>
                    </template>
                </Dropfile>

                <!-- 非图片文件列表 -->
                <div v-if="nonImageFiles.length > 0" class="mt-5 space-y-3 bg-background">
                    <div v-for="(fileStatus, i) in nonImageFiles" :key="fileStatus.file.name + i"
                        class="group relative rounded-md border border-gray-700 p-3 b ">
                        <div class="flex items-center justify-between gap-4">
                            <div class="flex items-center gap-3 flex-1">
                                <Icon icon="wenjianjia" class="h-10 w-10 opacity-60 text-gray-400" />

                                <div class="flex-1 min-w-0">
                                    <p class="text-xs font-medium truncate text-muted-foreground max-w-[100px]"
                                        :title="fileStatus.file.name">{{
                                            fileStatus.file.name }}</p>
                                    <p class="text-xs text-gray-400">
                                        {{ formatFileSize(fileStatus.file.size) }}
                                    </p>
                                </div>
                            </div>

                            <!-- 状态指示器 -->
                            <div class="flex items-center gap-2">
                                <div v-if="fileStatus.status === 'pending'" class="text-xs text-gray-400">等待上传</div>
                                <div v-if="fileStatus.status === 'uploading'" class="text-xs text-blue-400">上传中...</div>
                                <div v-if="fileStatus.status === 'success'" class="text-xs text-green-400">✓ 成功</div>
                                <div v-if="fileStatus.status === 'error'" class="text-xs text-red-400">✗ 失败</div>

                                <Button v-if="fileStatus.status === 'pending' || fileStatus.status === 'error'"
                                    size="icon-sm" variant="outline" @click="removeFile(files.indexOf(fileStatus))">
                                    <Icon icon="shanchu3" class="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <!-- 进度条 -->
                        <div v-if="fileStatus.status === 'uploading'" class="mt-2">
                            <Progress :model-value="fileStatus.progress" class="h-2" />
                            <p class="text-xs text-gray-400 mt-1 text-right">{{ fileStatus.progress }}%</p>
                        </div>

                        <!-- 错误信息 -->
                        <div v-if="fileStatus.status === 'error' && fileStatus.error" class="mt-2">
                            <p class="text-xs text-red-400">{{ fileStatus.error }}</p>
                        </div>
                    </div>
                </div>

                <!-- 图片文件的进度显示 -->
                <div v-if="hasImageFiles" class="mt-5 space-y-3">
                    <div v-for="(fileStatus, i) in imageFiles" :key="fileStatus.file.name + i">
                        <!-- 进度条 -->
                        <div v-if="fileStatus.status === 'uploading'" class="mt-2">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-xs text-gray-400 truncate max-w-[200px]">{{ fileStatus.file.name
                                    }}</span>
                                <span class="text-xs text-blue-400">{{ fileStatus.progress }}%</span>
                            </div>
                            <Progress :model-value="fileStatus.progress" class="h-2" />
                        </div>

                        <!-- 错误信息 -->
                        <div v-if="fileStatus.status === 'error' && fileStatus.error" class="mt-2">
                            <p class="text-xs text-red-400">{{ fileStatus.file.name }}: {{ fileStatus.error }}</p>
                        </div>
                    </div>
                </div>

                <!-- 上传按钮 -->
                <div v-if="files && files.length" class="mt-6 flex justify-end gap-3">
                    <Button variant="outline" @click="files = []" :disabled="uploading">
                        清空列表
                    </Button>
                    <Button @click="handleFileUpload" :disabled="uploading || files.length === 0">
                        <Icon v-if="uploading" name="lucide:loader-2" class="h-4 w-4 animate-spin mr-2" />
                        {{ uploading ? '上传中...' : '开始上传' }}
                    </Button>
                </div>
            </div>

        </DialogContent>
    </Dialog>

</template>