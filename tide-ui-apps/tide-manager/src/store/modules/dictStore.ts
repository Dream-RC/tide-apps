import { defineStore } from "pinia";
import { store } from "@/store";

import { CACHE_KEY, useCache } from "@/common/hooks/web/useCache";
import { DictDataApi, DictDataVo } from "@/common/api/system/dict/dictData";

const { wsCache } = useCache("sessionStorage");

export interface DictState {
    dictMap: Map<string, any>;
    isSetDict: boolean;
}

export const useDictStore = defineStore("dict", {
    state: (): DictState => ({
        dictMap: new Map<string, any>(),
        isSetDict: false,
    }),
    getters: {
        getDictMap(): Recordable {
            const dictMap = wsCache.get(CACHE_KEY.DICT_CACHE);
            if (dictMap) {
                this.dictMap = dictMap;
            }
            return this.dictMap;
        },
        getIsSetDict(): boolean {
            return this.isSetDict;
        },
    },
    actions: {
        async setDictMap() {
            const dictMap = wsCache.get(CACHE_KEY.DICT_CACHE);
            if (dictMap) {
                this.dictMap = dictMap;
                this.isSetDict = true;
            } else {
                const res = await DictDataApi.getSimpleDictDataList();
                // 设置数据
                const dictDataMap = new Map<string, any>();
                res.forEach((dictData: DictDataVo) => {
                    // 获得 dictType 层级
                    const enumValueObj = dictDataMap[dictData.dictType];
                    if (!enumValueObj) {
                        dictDataMap[dictData.dictType] = [];
                    }
                    // 处理 dictValue 层级
                    dictDataMap[dictData.dictType].push({
                        value: dictData.value,
                        name: dictData.name,
                        // colorType: dictData.colorType,
                        // cssClass: dictData.cssClass,
                    });
                });
                this.dictMap = dictDataMap;
                this.isSetDict = true;

                wsCache.set(CACHE_KEY.DICT_CACHE, dictDataMap, { exp: 60 }); // 60 秒 过期
            }
        },

        getDictByType(type: string) {
            if (!this.isSetDict) {
                this.setDictMap();
            }
            return this.dictMap[type];
        },
    },
});

export const useDictStoreWithOut = () => {
    return useDictStore(store);
};
