import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  addErrorHandler,
  addGlobalUncaughtErrorHandler,
  registerMicroApps,
  removeGlobalUncaughtErrorHandler,
  start,
} from "qiankun";
import useAppsStore from "./store/modules/appsStore";
import { checkAuth } from "./permission";
import App from "./App";

import "@/plugins/tailwind/index.css";
import "@/styles/index.scss";

// ==================== 全局异常捕获 ====================
addGlobalUncaughtErrorHandler((event: any) => {
  removeGlobalUncaughtErrorHandler(event);
  console.error("[qiankun] 全局未捕获异常:", event);
  if (
    (event.reason && event.reason.message === "Failed to fetch") ||
    (event.reason && event.reason.message === "Network request failed")
  ) {
    console.error("[qiankun] 子应用加载失败，请检查子应用服务是否启动");
  }
});

addErrorHandler((err) => {
  console.error("[qiankun] 子应用运行时错误:", err);
});

// ==================== 动态获取子应用列表并注册 ====================
const initQiankun = async () => {
  let apps: any[] = [];

  try {
    const res = await useAppsStore.getState().fetchApps();
    console.log("[qiankun] 接口获取子应用列表:", res);

    if (res && res.length > 0) {
      apps = res.map((item: any) => ({
        name: item.appCode,
        entry: item.url,
        container: "#subapp-container",
        activeRule: `/${item.appCode}`,
        props: { appId: item.appId },
      }));
    }
  } catch (err) {
    console.warn("[qiankun] 接口获取子应用列表失败:", err);
  }

  // ==================== 注册子应用 ====================
  registerMicroApps(apps, {
    beforeLoad: [
      async (app) => {
        if (!checkAuth()) {
          console.warn(`[qiankun] 未登录，阻止加载子应用: ${app.name}`);
          return false;
        }
        console.log(`[qiankun] 正在加载子应用: ${app.name}`);
      },
    ],
    beforeMount: [
      async (app) => console.log(`[qiankun] 即将挂载子应用: ${app.name}`),
    ],
    afterUnmount: [
      async (app) => console.log(`[qiankun] 已卸载子应用: ${app.name}`),
    ],
  });

  // ==================== 启动 Qiankun ====================
  start({
    sandbox: {
      experimentalStyleIsolation: true,
    },
    prefetch: false,
    getTemplate(tpl) {
      return tpl.replace(/<script type="module">[\s\S]*?<\/script>/g, "");
    },
    excludeAssetFilter: (url) => {
      return url.includes("@react-refresh");
    },
  });
};

// ==================== 渲染主应用 ====================
(async () => {
  await initQiankun();

  const root = document.getElementById("root")!;
  createRoot(root).render(
    <StrictMode>
      {/* <PermissionGuard> */}
      <App />
      {/* </PermissionGuard> */}
    </StrictMode>,
  );
})();