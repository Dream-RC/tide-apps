import request from "@/common/axios";

export interface FilePage extends PageParam {
    path?: string
    type?: string
    createTime?: Date[]
}

// 文件预签名地址 Response VO
export interface FilePresignedUrl {
    // 文件配置编号
    configId: number
    // 文件上传 URL
    uploadUrl: string
    // 文件 URL
    url: string
}

export const StorageFileApi = {

    // 上传文件
    updateFile: (data: any) => {
        return request.upload({url: '/infra/storage-file/upload', data})
    },
    // 查询文件列表
    getStorageFilePage: (params: FilePage) => {
        return request.get({url: '/infra/storage-file/page', params})
    },
    // 创建文件
    createStorageFile: (data: any) => {
        return request.post({url: '/infra/storage-file/create', data})
    },
    // 获取文件预签名地址
    getFilePresignedUrl: (path: string) => {
        return request.get<FilePresignedUrl>({
            url: '/infra/storage-file/presigned-url',
            params: {path}
        })
    }

}