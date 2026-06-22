<script setup lang="ts">
import {cloneDeep} from 'lodash-es'
import {CSSProperties} from 'vue'
import {IconJson} from "@/components/chronos-ui/Icon/src/data";

defineOptions({name: 'IconSelect'})

type ParameterCSSProperties = (item?: string) => CSSProperties | undefined

const iconList = ref(IconJson)

// 深拷贝图标数据，前端做搜索
const copyIconList = cloneDeep(iconList.value)
const icon = ref('add-location')


const props = defineProps({
  modelValue: {
    require: false,
    type: String
  },
  clearable: {
    require: false,
    type: Boolean
  }
})
const visible = ref(false)
const inputValue = toRef(props, 'modelValue')
const currentActiveType = ref('icon-font:')

const currentPage = ref(1)

const tabsList = [
  {
    label: '阿里图标库',
    name: 'icon-font:'
  }

]

const pageList = computed(() => {
  if (currentPage.value === 1) {
    return copyIconList[currentActiveType.value]
    // ?.filter((v) => v.includes(filterValue.value))
    // .slice(currentPage.value - 1, pageSize.value)
  } else {

  }
})

const iconItemStyle = computed((): ParameterCSSProperties => {
  return (item) => {
    if (inputValue.value === currentActiveType.value + item) {
      return {
        borderColor: 'var(--el-color-primary)',
        color: 'var(--el-color-primary)'
      }
    }
  }
})

function onChangeIcon(item) {
  icon.value = item
  emit('update:modelValue', item)
  visible.value = false
}

const emit = defineEmits<{ (e: 'update:modelValue', v: string) }>()


</script>

<template>

  <el-input v-model="inputValue" @click="visible = !visible">
    <template #append>
      <el-popover
          :popper-options="{
            placement: 'auto'
          }"
          :visible="visible"
          :width="355"
          popper-class="pure-popper"
          trigger="click"
      >
        <template #reference>
          <div
              class="h-32px w-40px flex cursor-pointer items-center justify-center"
              @click="visible = !visible"
          >
            <Icon :icon="icon"/>
          </div>

        </template>

        <el-input class="p-2" clearable placeholder="搜索图标"/>
        <el-divider border-style="dashed"/>

        <el-tabs v-model="currentActiveType">
          <el-tab-pane
              v-for="(pane, index) in tabsList"
              :key="index"
              :label="pane.label"
              :name="pane.name"
          >
            <el-divider border-style="dashed" class="tab-divider"/>
            <el-scrollbar height="220px">
              <ul class="ml-2 flex flex-wrap">
                <li
                    v-for="(item, key) in pageList"
                    :key="key"
                    :style="iconItemStyle(item)"
                    class="icon-item mr-2 mt-1 w-1/10 flex cursor-pointer items-center justify-center border border-solid p-2"
                    :title="item"
                    @click="onChangeIcon(item)"
                >
                  <Icon :icon="item"/>
                </li>
              </ul>
            </el-scrollbar>
          </el-tab-pane>


        </el-tabs>


      </el-popover>

    </template>
  </el-input>


</template>

<style lang="scss" scoped>
.el-divider--horizontal {
  margin: 1px auto !important;
}

.tab-divider.el-divider--horizontal {
  margin: 0 !important;
}

.icon-item {
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    transform: scaleX(1.05);
    transition: all 0.4s;
  }
}

:deep(.el-tabs__nav-next) {
  font-size: 15px;
  line-height: 32px;
  box-shadow: -5px 0 5px -6px #ccc;
}

:deep(.el-tabs__nav-prev) {
  font-size: 15px;
  line-height: 32px;
  box-shadow: 5px 0 5px -6px #ccc;
}

:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-tabs__item) {
  height: 30px;
  font-size: 12px;
  font-weight: normal;
  line-height: 30px;
}

:deep(.el-tabs__header),
:deep(.el-tabs__nav-wrap) {
  position: static;
  margin: 0;
}
</style>
