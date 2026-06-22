import { RouteRecordRaw } from "vue-router";

import { CACHE_KEY, useCache } from "./common/hooks/web/useCache";
import { getAccessToken } from "./common/utils/auth";
import router from "./router";

import { useDictStoreWithOut } from "./store/modules/dictStore";
import { usePermissionStoreWithOut } from "./store/modules/permission";
import { useUserStoreWithOut } from "./store/modules/user";
import { usePageLoading } from "./common/hooks/web/usePageLoading";
import { useNProgress } from "./common/hooks/web/useNProgress";

const { wsCache } = useCache();

const { loadStart, loadDone } = usePageLoading();
const { start, done } = useNProgress();

// 路由不重定向白名单
const whiteList = [
    "/login",
];

// 是否显示重新登录
export const isRelogin = { show: false };

router.beforeEach(async (to, from, next) => {
    console.log("to.path-------------------", getAccessToken());

    start();
    loadStart();

    if (getAccessToken()) {
        if (to.path === "/login") {
            next({ path: "/" });
        } else {
            // 获取所有字典
            const dictStore = useDictStoreWithOut();
            const userStore = useUserStoreWithOut();
            const permissionStore = usePermissionStoreWithOut();

            if (!dictStore.getIsSetDict) {
                await dictStore.setDictMap();
            }

            if (!userStore.getIsSetUser) {
                isRelogin.show = true;

                await userStore.setUserInfoAction();

                isRelogin.show = false;

                // 后端过滤菜单
                await permissionStore.generateRoutes();

                permissionStore.getAddRouters.forEach((route) => {
                    router.addRoute(route as unknown as RouteRecordRaw); // 动态添加可访问路由表
                });

                const redirectPath = from.query.redirect || to.path;

                const redirect = decodeURIComponent(redirectPath as string);

                const nextData = to.path === redirect
                    ? { ...to, replace: true }
                    : { path: redirect };

                next(nextData);
            } else {
                next();
            }
        }
    } else {
        if (whiteList.indexOf(to.path) !== -1) {
            next();
        } else {
            next(`/login?redirect=${to.fullPath}`); // 否则全部重定向到登录页
        }
    }
});

router.afterEach((to, from) => {
    done(); // 结束Progress
    loadDone();
});