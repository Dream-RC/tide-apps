import request from "@/common/axios";

export type DictDataVo = {
    id: string | undefined;
    sort: number | undefined;
    name: string;
    value: string;
    dictType: string;
    status: number;
    // colorType: string
    // cssClass: string
    description: string;
    createTime: Date;
};

export const DictDataApi = {
    // 查询字典数据列表
    getDictDataPage: (params: PageParam) => {
        return request.get({ url: "/system/dict-data/page", params });
    },
    // 查询字典数据（精简)列表
    getSimpleDictDataList: () => {
        return request.get({ url: "/system/dict-data/simple-list" });
    },
    // 查询字典数据详情
    getDictData: (id: string) => {
        return request.get({ url: "/system/dict-data/get?id=" + id });
    },
    // 新增字典数据
    createDictData: (data: DictDataVo) => {
        return request.post({ url: "/system/dict-data/create", data });
    },
    // 修改字典数据
    updateDictData: (data: DictDataVo) => {
        return request.put({ url: "/system/dict-data/update", data });
    },
};
