import request from "@/common/axios";

export const AppApi = {
    // 查询应用（精简)列表
    getSimpleAppList: () => {
        return request.get({ url: "/upms/app/simple-list" });
    },
};
