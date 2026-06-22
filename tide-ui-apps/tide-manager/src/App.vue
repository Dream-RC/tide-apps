<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import { CACHE_KEY, useCache } from './common/hooks/web/useCache';
import { isDark } from './common/utils/is';
import NProgress from './components/chronos-ui/nprogress/NProgress.vue';
import { useAppStore } from './store/modules/app';

const { wsCache } = useCache()
const appStore = useAppStore()


// 根据浏览器当前主题设置系统主题色
const setDefaultTheme = () => {
    let isDarkTheme = wsCache.get(CACHE_KEY.IS_DARK)
    if (isDarkTheme === null) {
        isDarkTheme = isDark()
    }
    appStore.setIsDark(isDarkTheme)
}
setDefaultTheme()




</script>

<template>
    <NProgress />
    <router-view />
    <Toaster theme="dark" :closeButton="true" closeButtonPosition="top-right" />

</template>