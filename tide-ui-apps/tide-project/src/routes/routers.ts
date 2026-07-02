// ==================== 基础路由配置（唯一注册源） ====================
export const baseRoutes: AppRouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layout/Layout.tsx"),
    children: [
      {
        path: "/index",
        component: () => import("@/pages/home/index.tsx"),
        meta: { title: "首页" },
      },
      {
        path: "/test",
        component: () => import("@/pages/home/test.tsx"),
        meta: { title: "测试页" },
      },
    ],
  },
];