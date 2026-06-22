import { defineStore } from "pinia";
import { CACHE_KEY, useCache } from "@/common/hooks/web/useCache";
import { store } from "../index";

export type LayoutType = "defaults" | "mix" | "classics";

export type ElementPlusSize = "default" | "small" | "large";

const { wsCache } = useCache();

interface AppState {
    layout: LayoutType;
    currentSize: ElementPlusSize;
    collapse: boolean;
    pageLoading: boolean;
    fixedMenu: boolean;
    isDark: boolean;
}

export const useAppStore = defineStore("app", {
    state: (): AppState => {
        return {
            // classics defaults
            layout: wsCache.get(CACHE_KEY.LAYOUT) || "defaults", // layout布局
            currentSize: wsCache.get("defaults") || "defaults", // 组件尺寸
            collapse: false, // 折叠菜单
            pageLoading: false, // 路由跳转loading
            fixedMenu: wsCache.get("fixedMenu") || false, // 是否固定菜单
            isDark: wsCache.get(CACHE_KEY.IS_DARK) || false, // 是否是暗黑模式
        };
    },
    getters: {
        getLayout(): LayoutType {
            return this.layout;
        },
        getCurrentSize(): ElementPlusSize {
            return this.currentSize;
        },
        getCollapse(): boolean {
            return this.collapse;
        },
        getPageLoading(): boolean {
            return this.pageLoading;
        },
        getFixedMenu(): boolean {
            return this.fixedMenu;
        },
        getIsDark(): boolean {
            return this.isDark;
        },
    },
    actions: {
        setLayout(layout: LayoutType) {
            this.layout = layout;
            wsCache.set(CACHE_KEY.LAYOUT, this.layout);
        },
        setCurrentSize(currentSize: ElementPlusSize) {
            this.currentSize = currentSize;
            wsCache.set("currentSize", this.currentSize);
        },
        setCollapse(collapse: boolean) {
            this.collapse = collapse;
        },
        setPageLoading(pageLoading: boolean) {
            this.pageLoading = pageLoading;
        },
        setFixedMenu(fixedMenu: boolean) {
            wsCache.set("fixedMenu", fixedMenu);
            this.fixedMenu = fixedMenu;
        },
        setIsDark(isDark: boolean) {
            this.isDark = isDark;
            if (this.isDark) {
                document.documentElement.setAttribute("data-theme", "dark");
            } else {
                document.documentElement.setAttribute("data-theme", "light");
            }
            wsCache.set(CACHE_KEY.IS_DARK, this.isDark);
        },
    },
});

export const useAppStoreWithOut = () => {
    return useAppStore(store);
};
