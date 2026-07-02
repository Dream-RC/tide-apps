import { LoginApi } from "@/common/api/login";
import { getAccessToken } from "@/common/utils/auth";
import { CACHE_KEY, useCache } from "@/common/hooks/web/useCache";
import { create } from "zustand";

const { wsCache } = useCache("sessionStorage");

type User = {
    id: number;
    avatar: string;
    nickname: string;
};

export type UserInfo = {
    // 属性定义
    permissions: string[];
    roles: string[];
    isSetUser: boolean;
    user: User;
};

export type UserInfoActions = {
    // 方法定义
    setUserInfoAction: () => Promise<void>;
    resetState: () => void;
    // 对应原 getters 的方法（也可直接访问 state，这里保留方法保持一致性）
    getPermissions: () => string[];
    getRoles: () => string[];
    getIsSetUser: () => boolean;
    getUser: () => User;
};

// 创建 Zustand Store
const useUserStore = create<UserInfo & UserInfoActions>(
    (set, get) => ({
        permissions: [],
        roles: [],
        isSetUser: false,
        user: {
            id: 0,
            avatar: "",
            nickname: "",
        },

        // 对应原 getters，直接返回当前 state
        getPermissions: () => get().permissions,
        getRoles: () => get().roles,
        getIsSetUser: () => get().isSetUser,
        getUser: () => get().user,

        // 对应原 actions 中的 setUserInfoAction
        setUserInfoAction: async () => {
            // 没有 token 时重置状态并返回
            if (!getAccessToken()) {
                get().resetState();
                return;
            }

            // 先从缓存读取用户信息
            let userInfo = wsCache.get(CACHE_KEY.USER);

            // 缓存中没有则请求接口
            if (!userInfo) {
                userInfo = await LoginApi.getInfo();
            }

            // 更新状态
            set({
                user: userInfo.user,
                isSetUser: true,
            });

            // 写入缓存
            wsCache.set(CACHE_KEY.USER, userInfo);
        },

        // 对应原 actions 中的 resetState
        resetState: () => {
            set({
                permissions: [],
                roles: [],
                isSetUser: false,
                user: {
                    id: 0,
                    avatar: "",
                    nickname: "",
                },
            });
        },
    }),
);

export default useUserStore;
