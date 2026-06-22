import request from "@/common/axios";

// BPM 流程模型 VO
export interface ModelVO {
  id?: string; // 编号
  name?: string; // 流程名称
  key?: string; // 流程标识
  description?: string; // 流程描述
  categoryId?: string; // 分类编号
  categoryName?: string; // 分类名称
  formType?: number; // 表单类型
  formId?: string; // 表单编号
  formName?: string; // 表单名称
  formCustomCreatePath?: string; // 表单自定义创建路径
  formCustomViewPath?: string; // 表单自定义查看路径
  status?: number; // 状态
  remark?: string; // 备注
  bpmnXml?: string; // BPMN XML
  simpleBpmnXml?: string; // 简化的 BPMN XML
  icon?: string; // 图标
  createTime?: string; // 创建时间
}

// BPM 流程模型 API
export const WorkFlowModelApi = {
  // 查询流程模型分页
  getModelPage: async (params: any) => {
    return await request.get({ url: `/workflow/model/page`, params });
  },

  // 查询流程模型列表
  getModelList: async (name?: string) => {
    return await request.get({ url: `/workflow/model/list`, params: { name } });
  },

  // 查询流程模型详情
  getModel: async (id: string) => {
    return await request.get({ url: `/workflow/model/get?id=` + id });
  },

  // 新增流程模型
  createModel: async (data: ModelVO) => {
    return await request.post({ url: `/workflow/model/create`, data });
  },

  // 修改流程模型
  updateModel: async (data: ModelVO) => {
    return await request.put({ url: `/workflow/model/update`, data });
  },

  // 复制流程模型
  copyModel: async (id: string) => {
    return await request.post({ url: `/workflow/model/copy`, params: { id } });
  },

  // 删除流程模型
  deleteModel: async (id: string) => {
    return await request.delete({ url: `/workflow/model/delete?id=` + id });
  },

  // 批量删除流程模型
  deleteModelList: async (ids: string[]) => {
    return await request.delete({ url: `/workflow/model/delete-list`, params: { ids: ids.join(",") } });
  },

  // 部署流程模型
  deployModel: async (id: string) => {
    return await request.post({ url: `/workflow/model/deploy?id=` + id });
  },

  // 清理流程模型
  cleanModel: async (id: string) => {
    return await request.post({ url: `/workflow/model/clean?id=` + id });
  },

  // 修改流程模型状态
  updateModelState: async (id: string, state: number) => {
    return await request.put({ url: `/workflow/model/update-state`, params: { id, state } });
  },

  // 批量更新流程模型的排序
  updateModelSortBatch: async (ids: string[]) => {
    return await request.put({
      url: `/workflow/model/update-sort-batch`,
      params: {
        ids: ids.join(","),
      },
    });
  },
};