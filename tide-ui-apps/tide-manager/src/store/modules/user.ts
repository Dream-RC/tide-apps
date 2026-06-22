import { defineStore } from "pinia";
import { store } from "@/store";

import { LoginApi } from "@/common/api/login";

import { CACHE_KEY, useCache } from "@/common/hooks/web/useCache";
import { getAccessToken } from "@/common/utils/auth";

const { wsCache } = useCache();

interface UserVO {
    id: string;
    avatar: string;
    nickname: string;
}

interface UserInfoVO {
    permissions: string[];
    roles: string[];
    isSetUser: boolean;
    user: UserVO;
}

export const useUserStore = defineStore("admin-user", {
    state: (): UserInfoVO => ({
        permissions: [],
        roles: [],
        isSetUser: false,
        user: {
            id: "0",
            avatar: "",
            nickname: "",
        },
    }),
    getters: {
        getPermissions(): string[] {
            return this.permissions;
        },
        getRoles(): string[] {
            return this.roles;
        },
        getIsSetUser(): boolean {
            return this.isSetUser;
        },
        getUser(): UserVO {
            return this.user;
        },
    },
    actions: {
        async setUserInfoAction() {
            if (!getAccessToken()) {
                this.resetState();
                return null;
            }
            let userInfo = wsCache.get(CACHE_KEY.USER);

            if (!userInfo) {
                userInfo = await LoginApi.getInfo("1910056713009500161");
            }
            this.permissions = userInfo.permissions;
            this.roles = userInfo.roles;
            this.user = userInfo.user;
            this.isSetUser = true;
            wsCache.set(CACHE_KEY.USER, userInfo);
            wsCache.set(CACHE_KEY.ROLE_ROUTERS, userInfo.menus);
        },
        resetState() {
            this.permissions = [];
            this.roles = [];
            this.isSetUser = false;
            this.user = {
                id: "0",
                avatar: "",
                nickname: "",
            };
        },
    },
});

export const useUserStoreWithOut = () => {
    return useUserStore(store);
};
