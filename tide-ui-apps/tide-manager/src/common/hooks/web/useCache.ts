/**
 * 配置浏览器本地存储的方式，可直接存储对象数组。
 */

import WebStorageCache from "web-storage-cache";

type CacheType = "localStorage" | "sessionStorage";

export const CACHE_KEY = {
    USER: "user",
    ROLE_ROUTERS: "roleRouters",
    DICT_CACHE: "dictCache",
    PROJECT_ROLE_MENU: "projectRoleMenu",
    PROJECT_ID: "projectId",
    TAB_MENU_ROUTERS: "tabMenuRouters",
    // 系统设置
    IS_DARK: "isDark",
    LAYOUT: "layout",
};

export const useCache = (type: CacheType = "localStorage") => {
    const wsCache: WebStorageCache = new WebStorageCache({
        storage: type,
    });

    return {
        wsCache,
    };
};
