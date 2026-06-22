import request from "@/common/axios";

export interface Role {
    id: string;
    name: string;
    code: string;
    sort: number;
    status: number;
    type: number;
    dataScope: number;
    dataScopeDeptIds: number[];
    createTime: Date;
}

export const RoleApi = {
    // 新增角色
    createRole: async (data: Role) => {
        return await request.post({ url: "/system/role/create", data });
    },
    // 查询角色详情
    getRole: async (id: string) => {
        return await request.get({ url: "/system/role/get?id=" + id });
    },
    // 查询角色列表
    getPage: async (params: PageParam) => {
        return await request.get({ url: "/system/role/page", params });
    },
    // 修改角色
    updateRole: async (data: Role) => {
        return await request.put({ url: "/system/role/update", data });
    },
    // 查询角色（精简)列表
    getSimpleRoleList: async (): Promise<Role[]> => {
        return await request.get({ url: "/system/role/simple-list" });
    },
};
