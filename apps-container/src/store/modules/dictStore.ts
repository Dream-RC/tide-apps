import { DictDataApi, DictDataVo } from "@/common/api/upms/dict/dictData";
import { CACHE_KEY, useCache } from "@/common/hooks/web/useCache";
import { create } from "zustand";

const { wsCache } = useCache("sessionStorage");

type DictState = {
    // 属性定义
    dictMap: Map<string, any>;
    isSetDict: boolean;
};

type DictActions = {
    // 方法定义
    setDictMap: () => Promise<void>;
    getIsSetDict: () => boolean;
    getDictByType: (type: string) => any[];
    getDictMap: () => Recordable;
};

// 创建 Zustand Store
const useDictStore = create<DictState & DictActions>(
    (set, get) => ({
        // 初始状态（对应原 Pinia 的 state）
        dictMap: new Map<string, any>(),
        isSetDict: false,

        // 对应原 actions 中的 setDictMap
        setDictMap: async () => {
            const dictCached = wsCache.get(CACHE_KEY.DICT_CACHE);

            if (dictCached) {
                const dictMap = new Map<string, any>(
                    Object.entries(dictCached),
                );
                set({ dictMap, isSetDict: true });
            } else {
                const res = await DictDataApi.getSimpleDictDataList();
                const dictDataMap = new Map<string, any>();

                res.forEach((dictData: DictDataVo) => {
                    const enumValueObj = dictDataMap.get(dictData.dictType);

                    if (!enumValueObj) {
                        dictDataMap.set(dictData.dictType, []);
                    }

                    dictDataMap.get(dictData.dictType)!.push({
                        value: dictData.value,
                        name: dictData.name,
                    });
                });

                set({ dictMap: dictDataMap, isSetDict: true });
                wsCache.set(
                    CACHE_KEY.DICT_CACHE,
                    Object.fromEntries(dictDataMap),
                    { exp: 60 },
                );
            }
        },

        getIsSetDict: () => {
            return get().isSetDict;
        },
        // 对应原 getters 中的 getDictMap
        getDictMap: () => {
            const cacheDictMap = wsCache.get(CACHE_KEY.DICT_CACHE);
            const currentDictMap = get().dictMap;
            // 如果缓存中有数据，更新到状态中（与原逻辑一致）
            if (cacheDictMap) {
                // 这里用 set 更新状态，保证响应式
                set({ dictMap: cacheDictMap });
                return cacheDictMap;
            }
            return currentDictMap;
        },

        // 对应原 actions 中的 getDictByType
        getDictByType: (type: string) => {
            const { isSetDict } = get();
            if (!isSetDict) {
                get().setDictMap();
            }
            return get().dictMap.get(type);
        },
    }),
);

export default useDictStore;
