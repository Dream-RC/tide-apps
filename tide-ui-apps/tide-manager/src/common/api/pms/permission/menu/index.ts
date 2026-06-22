import request from "@/common/axios";

export const ProjectMenuApi = {
    //查询菜单列表
    getMenuList: (params) => {
        return request.get({ url: "/project/menu/list", params });
    },
};
