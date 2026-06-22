import request from "@/common/axios";

export interface StorageClientConfig {
    basePath: string
    host?: string
    port?: number
    username?: string
    password?: string
    mode?: string
    endpoint?: string
    bucket?: string
    accessKey?: string
    accessSecret?: string
    domain: string
}

export interface StorageConfig {
    id: number
    name: string
    storage?: number
    master: boolean
    visible: boolean
    config: StorageClientConfig
    description: string
    createTime: Date
}

export const StorageConfigApi = {
    // 新增存储配置
    createStorageConfig: (data: StorageConfig) => {
        return request.post({url: '/infra/storage-config/create', data})
    },
    // 查询存储参数列表
    getStorageConfigPage: (params: PageParam) => {
        return request.get({url: '/infra/storage-config/page', params})
    },
    // 查询存储配置详情
    getStorageConfig: (id: number) => {
        return request.get({url: '/infra/storage-config/get?id=' + id})
    },
    // 修改存储配置
    updateStorageConfig: (data: StorageConfig) => {
        return request.put({url: '/infra/storage-config/update', data})
    },
    // 更新文件配置为主配置
    updateStorageConfigMaster: (id: number) => {
        return request.put({url: '/infra/storage-config/update-master?id=' + id})
    },
    // 测试文件配置
    testStorageConfig: (id: number) => {
        return request.get({url: '/infra/storage-config/test?id=' + id})
    }
}