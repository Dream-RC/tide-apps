import CryptoJS from 'crypto-js'
import { FilePresignedUrl, StorageFileApi } from '@/common/api/infrastructure/storage/file'
import axios from 'axios'



/**
 * 文件上传参数接口
 */
interface UploadOptions {
    file: File
    onProgress?: (progress: number) => void
    onSuccess?: (response: any) => void
    onError?: (error: any) => void
}

/**
 * 获得上传 URL
 */
export const getUploadUrl = (): string => {
    return import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL + '/infra/storage-file/upload'
}

/**
 * 通用文件上传函数
 */
export const uploadFile = async (options: UploadOptions): Promise<{ data: string }> => {
    // 是否使用前端直连上传
    const isClientUpload = (import.meta.env.VITE_UPLOAD_TYPE || UPLOAD_TYPE.SERVER) === UPLOAD_TYPE.CLIENT

    // 模式一：前端上传
    if (isClientUpload) {
        // 1.1 生成文件名称
        const fileName = await generateFileName(options.file)
        // 1.2 获取文件预签名地址
        const presignedInfo = await StorageFileApi.getFilePresignedUrl(fileName)

        // 1.3 上传文件
        return axios
            .put(presignedInfo.uploadUrl, options.file, {
                headers: {
                    'Content-Type': options.file.type
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && options.onProgress) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        options.onProgress(progress)
                    }
                }
            })
            .then(() => {
                // 1.4. 记录文件信息到后端（异步）
                createFile(presignedInfo, fileName, options.file)
                // 通知成功
                const result = { data: presignedInfo.url }
                options.onSuccess?.(result)
                return result
            })
            .catch((error) => {
                options.onError?.(error)
                throw error
            })

    } else {
        // 模式二：后端上传（待实现）
        return new Promise((resolve, reject) => {
            // TODO: 实现后端上传逻辑
            reject(new Error('后端上传模式暂未实现'))
        })
    }
}

/**
 * 批量上传文件
 */
export const uploadFiles = async (files: File[], options?: {
    onProgress?: (progress: number, file: File) => void
    onSuccess?: (response: any, file: File) => void
    onError?: (error: any, file: File) => void
}): Promise<Array<{ data: string }>> => {
    const results: Array<{ data: string }> = []
    
    for (const file of files) {
        try {
            const result = await uploadFile({
                file,
                onProgress: (progress) => options?.onProgress?.(progress, file),
                onSuccess: (response) => options?.onSuccess?.(response, file),
                onError: (error) => options?.onError?.(error, file)
            })
            results.push(result)
        } catch (error) {
            options?.onError?.(error, file)
            throw error
        }
    }
    
    return results
}

/**
 * 创建文件信息
 * @param vo 文件预签名信息
 * @param name 文件名称
 * @param file 文件
 */
function createFile(vo: FilePresignedUrl, name: string, file: File) {
    const fileVo = {
        configId: vo.configId,
        url: vo.url,
        path: name,
        name: file.name,
        type: file.type,
        size: file.size
    }
    StorageFileApi.createStorageFile(fileVo)
    return fileVo
}


/**
 * 生成文件名称（使用算法SHA256）
 * @param file 要上传的文件
 */
async function generateFileName(file: File) {
    // 读取文件内容
    const data = await file.arrayBuffer()
    const wordArray = CryptoJS.lib.WordArray.create(data)
    // 计算SHA256
    const sha256 = CryptoJS.SHA256(wordArray).toString()
    // 拼接后缀
    const ext = file.name.substring(file.name.lastIndexOf('.'))
    return `${sha256}${ext}`
}

/**
 * 上传类型
 */
enum UPLOAD_TYPE {
    // 客户端直接上传（只支持S3服务）
    CLIENT = 'client',
    // 客户端发送到后端上传
    SERVER = 'server'
}