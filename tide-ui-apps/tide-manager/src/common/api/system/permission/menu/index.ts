import request from "@/common/axios";

export interface MenuVo {
    id: string;
    name: string;
    sort: number;
    status: number;
}

export const MenuApi = {
    //查询菜单列表
    getMenuList: (params) => {
        return request.get({ url: "/system/menu/list", params });
    },
    // 获取菜单详情
    getMenu: (id: string) => {
        return request.get({ url: "/system/menu/get?id=" + id });
    },
    // 查询菜单（精简）列表
    getSimpleMenusList: () => {
        return request.get({ url: "/system/menu/list-all-simple" });
    },
    // 修改菜单
    updateMenu: (data: MenuVo) => {
        return request.put({ url: "/system/menu/update", data });
    },
    // 新增菜单
    createMenu: (data: MenuVo) => {
        return request.post({ url: "/system/menu/create", data });
    },
};
