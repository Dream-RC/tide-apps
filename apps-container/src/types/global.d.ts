export { };
declare global {
    // type Recordable<
    //     T = any,
    //     K extends PropertyKey | null | undefined = string,
    // > = Record<K extends null | undefined ? string : K, T>;

    type Recordable<
        T = any,
        K extends PropertyKey | null | undefined = string,
    > = Record<K extends null | undefined ? string : K, T>;

    type TokenType = {
        id: number; // 编号
        accessToken: string; // 访问令牌
        refreshToken: string; // 刷新令牌
        userId: number; // 用户编号
        userType: number; //用户类型
        clientId: string; //客户端编号
        expiresTime: number; //过期时间
    };

    interface PageParam {
        pageSize?: number;
        pageNo?: number;
    }
}
