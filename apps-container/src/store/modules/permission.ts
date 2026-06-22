import { CACHE_KEY, useCache } from "@/common/hooks/web/useCache";
import { generateRoute } from "@/common/utils/routerHelper";
import { create } from "zustand";


const { wsCache } = useCache('sessionStorage')


export type PermissionState = {
    // 属性定义
    routers: AppRouteRecordRaw[]
    addRouters: AppRouteRecordRaw[]
    menuTabRouters: AppRouteRecordRaw[]
}

export type PermissionActions = {

    getRouters: () => AppRouteRecordRaw[]

    generateRoutes: () => Promise<unknown>;

}

const usePermissionStore = create<PermissionState & PermissionActions>(
    (set, get) => ({

        routers: [],
        addRouters: [],
        menuTabRouters: [],


        getRouters(): AppRouteRecordRaw[] {
            return get().routers
        },


        generateRoutes: async () => {
            return new Promise<void>(async (resolve) => {

                let res: AppCustomRouteRecordRaw[] = [];

                if (wsCache.get(CACHE_KEY.ROLE_ROUTERS)) {
                    res = wsCache.get(CACHE_KEY.ROLE_ROUTERS) as AppCustomRouteRecordRaw[]
                }

                const routerMap: AppRouteRecordRaw[] = generateRoute(res)
                // 渲染菜单的所有路由
                // this.routers = cloneDeep(baseRoutes).concat(routerMap)
                set({
                    routers: routerMap
                })
                resolve()
            })
        },

    })
)

export default usePermissionStore