import { useCache } from "@/common/hooks/web/useCache";

const {wsCache} = useCache()

const AccessTokenKey = 'ACCESS_TOKEN'
const RefreshTokenKey = 'REFRESH_TOKEN'

export const getAccessToken = () => {
    // 此处与TokenKey相同，此写法解决初始化时Cookies中不存在TokenKey报错
    const accessToken = wsCache.get(AccessTokenKey)
    return accessToken ? accessToken : wsCache.get('ACCESS_TOKEN')
}

// 设置token
export const setToken = (token: TokenType) => {
    wsCache.set(RefreshTokenKey, token.refreshToken)
    wsCache.set(AccessTokenKey, token.accessToken)
}

// 刷新token
export const getRefreshToken = () => {
    return wsCache.get(RefreshTokenKey)
}

// 删除token
export const removeToken = () => {
    wsCache.delete(AccessTokenKey)
    wsCache.delete(RefreshTokenKey)
}