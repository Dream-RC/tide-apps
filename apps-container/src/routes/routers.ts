import type { AppRouteRecordRaw } from "@/types/router.d";

// ==================== 基础路由配置（唯一注册源） ====================
export const baseRoutes: AppRouteRecordRaw[] = [
  {
    path: "/login",
    component: () => import("@/pages/login/index.tsx"),
    meta: {
      title: "登录",
    },
  },
  {
    path: "/",
    // redirect: '/index',
    component: () => import("@/layout/Layout.tsx"),
    children: [
      {
        path: "/index",
        component: () => import("@/pages/home/index.tsx"),
        meta: {},
      },
    ],
  },
  {
    path: "*",
    component: () => import("@/pages/container/index.tsx"),
    meta: {},
  },
];
