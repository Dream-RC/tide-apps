import request from "@/common/axios";

export interface MemberUser {
  id: number;
  avatar: string | undefined;
  birthday: number | undefined;
  createTime: number | undefined;
  // loginDate: number | undefined
  // loginIp: string
  // mark: string
  mobile: string;
  // name: string | undefined
  // nickname: string | undefined
  // registerIp: string
  // sex: number
  // status: number
  // areaId: number | undefined
  // areaName: string | undefined
  // levelName: string | null
  // point: number | undefined | null
  // totalPoint: number | undefined | null
  // experience: number | null | undefined
}

// login: (data: UserLoginVO) => {
//     return request.post({ url: "/auth/login", data });
// },

export const MemberUserApi = {
  // 查询会员用户列表
  getUserPage: async (params) => {
    return await request.get({ url: `/member/user/page`, params });
  },
  // 查询会员用户详情
  getUser: async (id: number) => {
    return await request.get({ url: `/member/user/get?id=` + id });
  },
  // 修改会员用户
  updateUser: async (data: MemberUser) => {
    return await request.put({ url: `/member/user/update`, data });
  },

  // 修改会员用户等级
  updateUserLevel: async (data: any) => {
    return await request.put({ url: `/member/user/update-level`, data });
  },

  // 修改会员用户积分
  updateUserPoint: async (data: any) => {
    return await request.put({ url: `/member/user/update-point`, data });
  },
};
