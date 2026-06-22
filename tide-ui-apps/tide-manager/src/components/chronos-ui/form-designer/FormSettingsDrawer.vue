<template>
  <Drawer :open="visible" @open-change="handleOpenChange">
    <DrawerHeader>
      <DrawerTitle>表单设置</DrawerTitle>
    </DrawerHeader>
    <DrawerContent>
      <div class="form-settings-content">
        <Tabs :value="activeTab" class="w-full">
          <TabsList>
            <TabsTrigger value="buttons">按钮设置</TabsTrigger>
            <TabsTrigger value="other">其他设置</TabsTrigger>
          </TabsList>

          <!-- 按钮设置 -->
          <TabsContent value="buttons">
            <div class="settings-section">
              <h4>系统按钮</h4>
              <div class="system-buttons">
                <div v-for="(btn, index) in systemButtons" :key="index" class="button-item">
                  <div class="button-info">
                    <Badge :variant="getBadgeVariant(btn.type)">{{ btn.label }}</Badge>
                    <span class="button-desc">{{ btn.description }}</span>
                  </div>
                  <div class="button-actions">
                    <Input v-model="btn.label" placeholder="按钮名称" class="w-[120px]" size="sm" />
                    <Switch v-model="btn.visible" />
                    <span v-if="btn.visible" class="text-xs text-muted-foreground">显示</span>
                    <span v-else class="text-xs text-muted-foreground">隐藏</span>
                  </div>
                </div>
              </div>

              <Separator class="my-4" />

              <div class="section-header">
                <h4>自定义按钮</h4>
                <Button variant="default" size="sm" @click="handleAddCustomButton">
                  <Icon icon="lucide:plus" class="w-4 h-4 mr-1" />
                  添加按钮
                </Button>
              </div>

              <div class="custom-buttons">
                <div v-for="(btn, index) in customButtons" :key="index" class="custom-button-item">
                  <div class="button-config">
                    <div class="space-y-3">
                      <div class="flex items-center gap-3">
                        <Label class="w-[80px]">按钮名称</Label>
                        <Input v-model="btn.label" placeholder="请输入按钮名称" class="flex-1" />
                      </div>

                      <div class="flex items-center gap-3">
                        <Label class="w-[80px]">背景颜色</Label>
                        <Input v-model="btn.color" type="color" class="w-[100px]" />
                        <span>{{ btn.color }}</span>
                      </div>

                      <div class="flex items-center gap-3">
                        <Label class="w-[80px]">执行动作</Label>
                        <Select v-model="btn.actionId" @update:model-value="handleActionChange(index)" class="flex-1">
                          <SelectTrigger>
                            <SelectValue placeholder="请选择动作" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem v-for="action in actionList" :key="action.id" :value="action.id">
                              {{ action.actionName }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <!-- 动作变量配置 -->
                      <div v-if="btn.actionId && btn.actionVariables" class="action-variables">
                        <Separator class="my-3" />
                        <div class="font-medium mb-3">动作变量配置</div>
                        <div v-for="variable in btn.actionVariables" :key="variable.name" class="mb-3">
                          <Label class="w-[80px]">{{ variable.label }}</Label>
                          <div class="flex-1">
                            <div class="flex items-center gap-2">
                              <Badge variant="outline" class="text-xs">{{ variable.type }}</Badge>
                              <Input v-model="variable.value" :placeholder="`请输入${variable.label}`" class="flex-1" />
                            </div>
                            <div class="variable-desc" v-if="variable.description">
                              {{ variable.description }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="button-actions">
                    <Button variant="destructive" size="sm" @click="handleRemoveCustomButton(index)">
                      <Icon icon="lucide:trash-2" class="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div v-if="customButtons.length === 0" class="empty-state">
                  <div class="text-center py-8">
                    <Icon icon="lucide:button" class="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p class="text-muted-foreground">暂无自定义按钮</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- 其他设置 -->
          <TabsContent value="other">
            <div class="settings-section">
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <Label class="w-[100px]">表单宽度</Label>
                  <Input v-model="formSettings.width" placeholder="例如: 100%, 800px" class="flex-1" />
                </div>

                <div class="flex items-center gap-3">
                  <Label class="w-[100px]">按钮对齐</Label>
                  <RadioGroup v-model="formSettings.buttonAlign" class="flex gap-4">
                    <RadioGroupItem value="left">左对齐</RadioGroupItem>
                    <RadioGroupItem value="center">居中</RadioGroupItem>
                    <RadioGroupItem value="right">右对齐</RadioGroupItem>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DrawerContent>
    <DrawerFooter>
      <Button variant="outline" @click="handleClose">取消</Button>
      <Button variant="default" @click="handleSave">保存设置</Button>
    </DrawerFooter>
  </Drawer>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Icon } from '@/components/chronos-ui/Icon'
import { actionEngineApi } from '@/api/actionEngine'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  settings: {
    type: Object,
    default: () => ({})
  },
  appId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = ref(props.modelValue)
const activeTab = ref('buttons')
const actionList = ref([])

// 系统按钮配置
const systemButtons = ref([
  {
    key: 'reset',
    label: '重置',
    type: 'default',
    description: '重置表单内容',
    visible: true,
    action: 'reset'
  },
  {
    key: 'submit',
    label: '保存',
    type: 'primary',
    description: '提交表单数据',
    visible: true,
    action: 'submit'
  }
])

// 自定义按钮配置
const customButtons = ref([])

// 表单其他设置
const formSettings = reactive({
  width: '100%',
  buttonAlign: 'right'
})

const getBadgeVariant = (type) => {
  switch (type) {
    case 'primary':
      return 'default'
    default:
      return 'outline'
  }
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    loadSettings()
    loadActionList()
  }
})

// 加载设置
const loadSettings = () => {
  if (props.settings) {
    // 加载系统按钮设置
    if (props.settings.systemButtons) {
      systemButtons.value = props.settings.systemButtons
    }

    // 加载自定义按钮设置
    if (props.settings.customButtons) {
      customButtons.value = props.settings.customButtons
    }

    // 加载其他设置
    if (props.settings.formSettings) {
      Object.assign(formSettings, props.settings.formSettings)
    }
  }
}

// 加载动作引擎列表
const loadActionList = async () => {
  try {
    const params = {
      pageNum: 1,
      pageSize: 1000,
      status: 1 // 只加载已启用的动作
    }

    // 如果有 appId，则只加载当前应用下的动作
    if (props.appId) {
      params.appId = props.appId
    }

    const response = await actionEngineApi.getActionList(params)

    if (response.code === 200 && response.data) {
      actionList.value = response.data.records || response.data || []
    }
  } catch (error) {
    console.error('加载动作列表失败:', error)
    toast.error('加载动作列表失败')
  }
}

// 添加自定义按钮
const handleAddCustomButton = () => {
  customButtons.value.push({
    label: '自定义按钮',
    color: '#409EFF',
    actionId: null,
    actionVariables: []
  })
}

// 删除自定义按钮
const handleRemoveCustomButton = (index) => {
  customButtons.value.splice(index, 1)
}

// 动作变化时，加载动作变量
const handleActionChange = async (index) => {
  const button = customButtons.value[index]
  if (!button.actionId) {
    button.actionVariables = []
    return
  }

  try {
    // 获取动作详情，包括变量定义
    const response = await actionEngineApi.getActionDetail(button.actionId)
    if (response.code === 200 && response.data) {
      const action = response.data

      // 解析动作变量
      if (action.variables) {
        const variables = typeof action.variables === 'string'
          ? JSON.parse(action.variables)
          : action.variables

        button.actionVariables = variables.map(v => ({
          name: v.name,
          label: v.label || v.name,
          type: v.type || 'string',
          description: v.description || '',
          value: v.defaultValue || ''
        }))
      } else {
        button.actionVariables = []
      }
    }
  } catch (error) {
    console.error('加载动作变量失败:', error)
    toast.error('加载动作变量失败')
  }
}

// 保存设置
const handleSave = () => {
  const settings = {
    systemButtons: systemButtons.value,
    customButtons: customButtons.value,
    formSettings: formSettings
  }

  emit('save', settings)
  handleClose()
}

// 关闭抽屉
const handleClose = () => {
  visible.value = false
}

// 处理抽屉打开状态变化
const handleOpenChange = (open) => {
  emit('update:modelValue', open)
}

onMounted(() => {
  if (visible.value) {
    loadSettings()
    loadActionList()
  }
})
</script>

<style lang="scss" scoped>
.form-settings-content {
  padding: 20px;

  .settings-section {
    h4 {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h4 {
        margin: 0;
      }
    }

    .system-buttons {
      .button-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        // background: var(--bg-tertiary);
        border-radius: 6px;
        margin-bottom: 12px;

        .button-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .button-desc {
            font-size: 13px;
            color: var(--text-secondary);
          }
        }

        .button-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }
    }

    .custom-buttons {
      .custom-button-item {
        padding: 16px;
        // background: var(--bg-tertiary);
        border-radius: 8px;
        margin-bottom: 16px;
        border: 1px solid var(--border-color);

        .button-config {
          margin-bottom: 12px;

          .action-variables {
            margin-top: 16px;
            padding: 12px;
            // background: var(--bg-card);
            border-radius: 6px;

            .variable-desc {
              font-size: 12px;
              color: var(--text-secondary);
              margin-top: 4px;
            }
          }
        }

        .button-actions {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
