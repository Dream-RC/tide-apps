// @ts-ignore
export const fileSizeFormatter = (cellValue) => {
    const fileSize = cellValue;
    const unitArr = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const srcSize = parseFloat(fileSize);
    const index = Math.floor(Math.log(srcSize) / Math.log(1024));
    const size = srcSize / Math.pow(1024, index);
    const sizeStr = size.toFixed(2); //保留的小数位数
    return sizeStr + " " + unitArr[index];
};

// 文件上传状态
export interface FileUploadStatus {
    file: File;
    progress: number;
    status: "pending" | "uploading" | "success" | "error";
    error?: string;
}

export const formatFileSize = (fileSize: number) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
};

// 判断是否为图片文件
export const isImage = (file: File | undefined): boolean => {
    return file?.type?.startsWith('image/') || false;
};