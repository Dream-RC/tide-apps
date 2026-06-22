import request from "@/common/axios";

export interface PermissionAssignRoleMenuReqVO {
    roleId: string;
    menuIds: string[];
}

export interface PermissionAssignUserRoleReqVO {
    userId: string;
    roleIds: string[];
}

export const PermissionApi = {
    // 查询角色拥有的菜单权限
    getRoleMenuList: async (roleId: string) => {
        return await request.get({
            url: "/system/permission/list-role-menus?roleId=" + roleId,
        });
    },
    // 赋予角色菜单权限
    assignRoleMenu: async (data: PermissionAssignRoleMenuReqVO) => {
        return await request.post({
            url: "/system/permission/assign-role-menu",
            data,
        });
    },
    // 查询用户拥有的角色数组
    getUserRoleList: async (userId: string) => {
        return await request.get({
            url: "/system/permission/list-user-roles?userId=" + userId,
        });
    },
    // 赋予用户角色
    assignUserRole: async (data: PermissionAssignUserRoleReqVO) => {
        return await request.post({
            url: "/system/permission/assign-user-role",
            data,
        });
    },
};
