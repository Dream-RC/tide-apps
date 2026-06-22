import request from "@/common/axios";

/**
 * 导航分类
 */
export interface Career {
    /**
     * 分类编号
     */
    id?: string;
    /**
     * 父分类编号
     */
    parentId?: number;
    /**
     * 分类名称
     */
    name: string;
    /**
     * 分类排序
     */
    sort: number;
    /**
     * 开启状态
     */
    status: number;
}

export const CareerApi = {
    // 创建导航分类
    createCategory: (data: Career) => {
        return request.post({ url: "/system/career/create", data });
    },
    // 获得导航分类
    getCategory: (id: string) => {
        return request.get({ url: `/system/career/get?id=${id}` });
    },
    // 查询导航分类列表
    getCategoryList: (params: any) => {
        return request.get({ url: "/system/career/list", params });
    },
    // 更新导航分类
    updateCategory: (data: Career) => {
        return request.put({ url: "/system/career/update", data });
    },
};
