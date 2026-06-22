import request from "@/common/axios";

export type UserLoginVO = {
  username: string;
  password: string;
};

export type TokenType = {
  id: number; // 编号
  accessToken: string; // 访问令牌
  refreshToken: string; // 刷新令牌
  userId: number; // 用户编号
  userType: number; //用户类型
  clientId: string; //客户端编号
  expiresTime: number; //过期时间
};

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
