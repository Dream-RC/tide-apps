import request from "@/common/axios";

export interface UserVo {
    id: string;
    username: string;
    nickname: string;
    email: string;
    mobile: string;
    sex: number;
    avatar: string;
    loginIp: string;
    status: number;
    description: string;
    loginDate: Date;
    createTime: Date;
}

export const UserApi = {
    // 新增用户
    createUser: (data: UserVo) => {
        return request.post({ url: "/system/user/create", data });
    },
    //查询用户列表
    getUserPage: (params: PageParam) => {
        return request.get({ url: "/system/user/page", params });
    },
    // 查询用户详情
    getUser: (id: string) => {
        return request.get({ url: "/system/user/get?id=" + id });
    },
    // 修改用户
    updateUser: (data: UserVo) => {
        return request.put({ url: "/system/user/update", data });
    },
    // 获取用户精简信息列表
    getSimpleUserList: (): Promise<UserVo[]> => {
        return request.get({ url: "/system/user/simple-list" });
    },
};
