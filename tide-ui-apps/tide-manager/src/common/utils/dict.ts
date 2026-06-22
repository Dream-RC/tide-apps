import { useDictStore } from "@/store/modules/dictStore";

const dictStore = useDictStore();

export enum DICT_TYPE {
    COMMON_STATUS = "common_status",

    // ========== SYSTEM 模块 ==========
    SYSTEM_MENU_TYPE = "system_menu_type",
    SYSTEM_USER_SEX = "system_user_sex",
    // ========== PMS 模块 ==========
    PROJECT_DISCLOSURE = "project_disclosure",
    TASKPRIORITY = "task_priority",
    DIFFICULTYCOEFFICIENT = "difficulty_coefficient",
    TASKSTATUS = "task_status",
    STORAGE_CONFIG = "storage_config",
    TASK_REWARD_STATUS = "task_reward_status",
    Flow_MODEL_TYPE = "flow_mode_type",
    Flow_FORM_TYPE = "flow_form_type",
}

/**
 * 获取 dictType 对应的数据字典数组
 *
 * @param dictType 数据类型
 * @returns {*|Array} 数据字典数组
 */
export interface DictDataType {
    dictType: string;
    name: string;
    value: string | number | boolean;
    // colorType: ElementPlusInfoType | ''
    cssClass: string;
}

export interface NumberDictDataType extends DictDataType {
    value: number;
}

export const getIntDictOptions = (dictType: string): NumberDictDataType[] => {
    // 获得通用的 DictDataType 列表
    const dictOptions: DictDataType[] = getDictOptions(dictType);
    // 转换成 number 类型的 NumberDictDataType 类型
    // why 需要特殊转换：避免 IDEA 在 v-for="dict in getIntDictOptions(...)" 时，el-option 的 key 会告警
    const dictOption: NumberDictDataType[] = [];
    dictOptions.forEach((dict: DictDataType) => {
        dictOption.push({
            ...dict,
            value: parseInt(dict.value + ""),
        });
    });
    return dictOption;
};

export const getDictOptions = (dictType: string) => {
    return dictStore.getDictByType(dictType) || [];
};
