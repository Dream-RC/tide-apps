// 创建axios实例
import axios, { AxiosError, AxiosRequestHeaders, AxiosResponse } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { config } from "@/common/axios/config";
import { getAccessToken } from "@/common/utils/auth";
import qs from "qs";
import { toast } from "vue-sonner";
import errorCode from "./errorCode";

const { result_code, base_url, request_timeout } = config;

const whiteList: string[] = ["/login", "/refresh-token"];

const service: AxiosInstance = axios.create({
    baseURL: base_url, // api 的 base_url
    timeout: request_timeout, // 请求超时时间
    withCredentials: false, // 禁用 Cookie 等信息
});

// 需要忽略的提示。忽略后，自动 Promise.reject('error')
const ignoreMsgs = [
    "无效的刷新令牌", // 刷新令牌被删除时，不用提示
    "刷新令牌已过期", // 使用刷新令牌，刷新获取新的访问令牌时，结果因为过期失败，此时需要忽略。否则，会导致继续 401，无法跳转到登出界面
];

// request拦截器
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        let isToken = (config!.headers || {}).isToken === false;

        whiteList.some((v) => {
            if (config.url) {
                config.url.indexOf(v) > -1;
                return (isToken = false);
            }
        });

        if (getAccessToken() && !isToken) {
            (config as Recordable).headers.Authorization = "Bearer " +
                getAccessToken(); // 让每个请求携带自定义token
        }

        const params = config.params || {};
        const data = config.data || false;

        if (
            config.method?.toUpperCase() === "POST" &&
            (config.headers as AxiosRequestHeaders)["Content-Type"] ===
                "application/x-www-form-urlencoded"
        ) {
            config.data = qs.stringify(data);
        }

        // get参数编码
        if (config.method?.toUpperCase() === "GET" && params) {
            let url = config.url + "?";
            for (const propName of Object.keys(params)) {
                const value = params[propName];
                if (
                    value !== void 0 && value !== null &&
                    typeof value !== "undefined"
                ) {
                    if (typeof value === "object") {
                        for (const val of Object.keys(value)) {
                            const params = propName + "[" + val + "]";
                            const subPart = encodeURIComponent(params) + "=";
                            url += subPart + encodeURIComponent(value[val]) +
                                "&";
                        }
                    } else {
                        url += `${propName}=${encodeURIComponent(value)}&`;
                    }
                }
            }
            // 给 get 请求加上时间戳参数，避免从缓存中拿数据
            // const now = new Date().getTime()
            // params = params.substring(0, url.length - 1) + `?_t=${now}`
            url = url.slice(0, -1);
            config.params = {};
            config.url = url;
        }

        return config;
    },
    (error: AxiosError) => {
        // Do something with request error
        console.log(error); // for debug
        Promise.reject(error);
    },
);

// response 拦截器
service.interceptors.response.use(
    async (response: AxiosResponse<any>) => {
        let { data } = response;

        // const config = response.config;

        if (!data) {
            // 返回“[HTTP]请求没有返回值”;
            throw new Error();
        }

        // 二进制数据则直接返回
        if (
            response.request.responseType === "blob" ||
            response.request.responseType === "arraybuffer"
        ) {
            if (response.data.type !== "application/json") {
                return response.data;
            }
            data = await new Response(response.data).json();
        }

        // 未设置状态码则默认成功状态
        const code = data.code || result_code;

        // 获取错误信息
        const msg = data.message || errorCode[code] || errorCode["default"];

        if (ignoreMsgs.indexOf(msg) !== -1) {
            // 如果是忽略的错误码，直接返回 msg 异常
            return Promise.reject(msg);
        } else if (code !== 200) {
            if (msg === "无效的刷新令牌") {
                // hard coding：忽略这个提示，直接登出
                // console.log(msg);
                // return handleAuthorized();
            } else {
                toast.error(msg);
            }

            return Promise.reject("error");
        }

        return data;
    },
    (error: AxiosError) => {
        // console.log("err" + error); // for debug
        // let { message } = error;
        // toast.error(message);

        // return Promise.reject(error);
    },
);

export { service };
