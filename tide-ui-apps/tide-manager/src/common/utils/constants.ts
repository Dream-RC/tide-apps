export const CommonStatusEnum = {
    ENABLE: 0, //开启
    DISABLE: 1, //禁用
};

export const ProjecMemberRole = {
    PARTICIPANTROLE: 1, //参与人
    CUSTOMROLE: 2, //自定义角色
    MixedRole: 3, //混合角色
};

export const WebSocketMessageTypeConstants = {
    CHATLOBBY_MESSAGE_TYPE: "chatLobby_message_type", // 聊天大厅消息类型
    CHATLOBBY_MESSAGE_READ: "chatLobby_message_read_status_change", // 聊天大厅消息信息已读
};

// 消息类型枚举类
export const MessageContentTypeEnum = {
    TEXT: 1, // 文本消息
    IMAGE: 2, // 图片消息
    VOICE: 3, // 语音消息
    VIDEO: 4, // 视频消息
    SYSTEM: 5, // 系统消息
};

export const WorkflowFormType = {
    NORMAL: 1, // 流程表单
    CUSTOM: 2, // 业务表单
};

export const WorkflowModelType = {
    BPMN: 1, // BPMN 设计器
    SIMPLE: 2, // 简易设计器
};

export const BpmAutoApproveType = {
    NONE: 0, // 不自动审批
    AUTO: 1, // 自动审批
};
