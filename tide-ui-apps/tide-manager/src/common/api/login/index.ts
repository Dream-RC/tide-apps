import request from "@/common/axios";
import type { UserLoginVO } from "./types";

export const LoginApi = {
    // 登录
    login: (data: UserLoginVO) => {
        return request.post({ url: "/auth/login", data });
    },
    // 获取用户权限信息
    getInfo: () => {
        return request.get({ url: "/system/permission/get-permission-info" });
    },
};
