import type { ComponentType } from "react";

declare global {
  // ===================== 路由元信息类型 =====================
  export interface IRouteMeta {
    title?: string;
  }

  // ===================== 代码式路由配置类型（对标 Vue Router 的 RouteRecordRaw） =====================
  export interface AppRouteRecordRaw {
    path: string;
    name?: string;
    meta?: IRouteMeta;
    component?: () => Promise<{ default: ComponentType<any> }>;
    children?: AppRouteRecordRaw[];
  }

  export interface AppCustomRouteRecordRaw {
    icon: any;
    name: string;
    meta: IRouteMeta;
    component?: () => Promise<{ default: ComponentType<any> }>;
    path: string;
    redirect: string;
    children?: AppCustomRouteRecordRaw[];
    keepAlive?: boolean;
    visible?: boolean;
    parentId?: number;
    alwaysShow?: boolean;
  }
}
