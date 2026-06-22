import request from "@/common/axios";

export type DictTypeVo = {
    id: string | undefined;
    name: string;
    type: string;
    status: number;
    remark: string;
    createTime: Date;
};

export const DictTypeApi = {
    // 查询字典数据列表
    getPage: (params: PageParam) => {
        return request.get({ url: "/system/dict-type/page", params });
    },
    // 新增字典
    createDictType: (data: DictTypeVo) => {
        return request.post({ url: "/system/dict-type/create", data });
    },
    // 查询字典详情
    getDictType: (id: string) => {
        return request.get({ url: "/system/dict-type/get?id=" + id });
    },
    // 修改字典
    updateDictType: (data: DictTypeVo) => {
        return request.put({ url: "/system/dict-type/update", data });
    },
};
