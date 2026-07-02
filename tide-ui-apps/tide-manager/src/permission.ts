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
const whiteList = ["/login"];

// 是否显示重新登录
export const isRelogin = { show: false };

router.beforeEach(async (to, from) => {
  console.log("to.path-------------------", getAccessToken());

  start();
  loadStart();

  // ===== 有 token =====
  if (getAccessToken()) {
    if (to.path === "/login") {
      return { path: "/" };
    }

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

      await permissionStore.generateRoutes();

      permissionStore.getAddRouters.forEach((route) => {
        router.addRoute(route as unknown as RouteRecordRaw);
      });

      const redirectPath = (from.query.redirect || to.path) as string;
      const redirect = decodeURIComponent(redirectPath);

      return redirect === to.path
        ? { ...to, replace: true }
        : { path: redirect };
    }

    return true;
  }

  // ===== 没 token =====
  if (whiteList.includes(to.path)) {
    return true;
  }

  return {
    path: "/login",
    query: { redirect: to.fullPath },
  };
});

router.afterEach((to, from) => {
  done(); // 结束Progress
  loadDone();
});
