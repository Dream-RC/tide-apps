import { ref } from "vue";

// 单例状态
const isLoading = ref(false);
const progress = ref(0);
let progressInterval: number | null = null;
const minDisplayTime = 200; // 最小显示时间
let startTime = 0;

// 清理定时器
const cleanup = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
};

export const useNProgress = () => {
  const start = () => {
    // 重置进度
    progress.value = 0;
    isLoading.value = true;
    startTime = Date.now();

    // 开始进度动画 - 直接加载到100%
    progressInterval = window.setInterval(() => {
      // 基于时间的线性进度
      const elapsedTime = Date.now() - startTime;
      const totalExpectedTime = 2000; // 预计总耗时2秒

      // 直接计算进度百分比，可以超过95%
      let targetProgress = (elapsedTime / totalExpectedTime) * 100;

      // 确保进度不超过100%
      targetProgress = Math.min(targetProgress, 100);

      // 直接设置进度值
      progress.value = targetProgress;

      // 如果达到100%，自动清理并隐藏
      if (targetProgress >= 100) {
        cleanup();
        isLoading.value = false;
      }
    }, 50);
  };

  const done = async () => {
    // 确保至少显示最小时间
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < minDisplayTime) {
      await new Promise((resolve) =>
        setTimeout(resolve, minDisplayTime - elapsedTime)
      );
    }

    // 如果进度还没到100%，直接设置到100%
    if (progress.value < 100) {
      progress.value = 100;
      // 等待进度条动画完成
      // await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // 清理并隐藏
    cleanup();
    isLoading.value = false;
  };

  return {
    isLoading,
    progress,
    start,
    done,
  };
};
