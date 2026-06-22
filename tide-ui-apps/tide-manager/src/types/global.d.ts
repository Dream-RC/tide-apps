export {};
declare global {
    type Recordable<T = any, K = string> = Record<
        K extends null | undefined ? string : K,
        T
    >;
    type Nullable<T> = T | null;

    interface PageParam {
        pageSize?: number;
        pageNo?: number;
    }

    interface Tree {
        id: string;
        name: string;
        children?: Tree[] | any[];
    }
}
