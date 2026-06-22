import request from "@/common/axios";

export type FormVO = {
    id?: string;
    name: string;
    config: string;
    //   fields: string[]
    status: number;
    description: string;
    //   createTime: string
};

export const WorkFlowFormApi = {
    // 创建工作流的表单定义
    createForm: async (data: FormVO) => {
        return await request.post({
            url: "/workflow/form/create",
            data: data,
        });
    },
    // 获得工作流的表单定义
    getForm: async (id: string) => {
        return await request.get({
            url: "/workflow/form/get?id=" + id,
        });
    },

    // 获得工作流的表单定义分页
    getFormPage: async (params) => {
        return await request.get({
            url: "/workflow/form/page",
            params,
        });
    },

    // 更新工作流的表单定义
    updateForm: async (data: FormVO) => {
        return await request.put({
            url: "/workflow/form/update",
            data: data,
        });
    },
    // 获得动态表单的精简列表
    getFormSimpleList: async () => {
        return await request.get({
            url: "/workflow/form/simple-list",
        });
    },
};
