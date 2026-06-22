import { createBrowserRouter } from "react-router";
import { baseRoutes } from "./routers";

function buildRoute(config: AppRouteRecordRaw): any {
  const route: any = {
    path: config.path,
  };

  if (config.component) {
    route.lazy = async () => {
      const mod = await config.component!();
      return { Component: mod.default };
    };
  }

  if (config.children?.length) {
    route.children = config.children.map((child) => buildRoute(child));
  }

  return route;
}

function stripComponent(route: AppRouteRecordRaw): AppRouteRecordRaw {
  const { component, ...rest } = route;
  rest.children = rest.children?.map(stripComponent);
  return rest as AppRouteRecordRaw;
}

export function createRouter(dynamicRoutes: AppRouteRecordRaw[] = []) {
  const layoutRoute = baseRoutes.find((r) => r.path === "/")!;
  const existingChildren = layoutRoute.children || [];
  const catchAll = existingChildren.find((c) => c.path === "*");
  const otherChildren = existingChildren.filter((c) => c.path !== "*");

  const combinedRoutes: AppRouteRecordRaw[] = baseRoutes.map((route) => {
    if (route.path !== "/") return route;

    return {
      ...route,
      children: [
        ...otherChildren,
        ...dynamicRoutes.map(stripComponent),
        ...(catchAll ? [catchAll] : []),
      ],
    };
  });

  return createBrowserRouter(combinedRoutes.map((route) => buildRoute(route)));
}

export const router = createRouter();