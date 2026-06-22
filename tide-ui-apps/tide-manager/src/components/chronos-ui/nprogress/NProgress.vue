<script setup lang="ts">
import { useNProgress } from '@/common/hooks/web/useNProgress'
import { Progress } from '@/components/ui/progress'

const { isLoading, progress } = useNProgress()

// 精灵图总帧数
const frameCount = 30 // 根据你的精灵图实际帧数调整

</script>

<template>
    <Transition name="fade">
        <div v-if="isLoading"
            class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div class="bg-white rounded-lg shadow-xl p-8 w-96">
                <div class="text-center">
                    <!-- <div class="mb-4"> -->
                    <!-- <div class="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center"> -->
                    <!-- <svg class="w-8 h-8 text-primary animate-spin" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg> -->
                    <!-- 精灵图进度条 -->

                    <!-- </div> -->
                    <!-- </div> -->

                    <div class="zzz-loading__anim"></div>

                    <h3 class="text-lg font-semibold text-foreground mb-2">加载中...</h3>
                    <p class="text-sm text-muted-foreground mb-6">正在加载页面，请稍候...</p>
                    <div class="space-y-2">
                        <Progress :modelValue="progress" class="h-2" />
                        <p class="text-xs text-muted-foreground text-center">{{ Math.round(progress) }}%</p>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}


.zzz-loading__anim {
    /* position: absolute;
  right: 16.875px;
  bottom: 28.125px; */
    width: 298.125px;
    height: 84.375px;
    background: url(@/assets/ui/loading/loading.png);
    background-size: 100% 3000%;
    /* 精灵图总高度 = 30 帧 * 100% */
    background-position: 0 0;
    animation: loadingLoop .5s steps(30) infinite forwards;
    /* 30 帧，循环播放 */
}

/* 关键帧动画：从上到下播放 */
@keyframes loadingLoop {
    0% {
        background-position: 0 0;
    }

    100% {
        background-position: 0 -3000%;
    }
}
</style>