import request from "@/common/axios";

export interface MemberLevelVO {
  id?: string;
  name: string;
  icon?: string;
  backgroundUrl?: string;
  spaceLimit: number;
  storageSpace: number;
  memberLimit: number;
  memberPrice: number;
  // experience: number
  // value: number
  // discountPercent: number

  sort: number;
  status: number;
}

export const MemberLevelApi = {
  // 新增会员等级
  createLevel: async (data: MemberLevelVO) => {
    return await request.post({ url: `/member/level/create`, data });
  },
  // 查询会员等级列表
  getLevelList: async (params) => {
    return await request.get({ url: `/member/level/list`, params });
  },
  // 查询会员等级详情
  getLevel: async (id: string) => {
    return await request.get({ url: `/member/level/get?id=` + id });
  },
  // 修改会员等级
  updateLevel: async (data: MemberLevelVO) => {
    return await request.put({ url: `/member/level/update`, data });
  },
};
