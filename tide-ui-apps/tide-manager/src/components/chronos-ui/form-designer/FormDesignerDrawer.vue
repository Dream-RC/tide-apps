<template>
  <Drawer :open="visible" @open-change="handleOpenChange">
    <DrawerContent class="p-0 overflow-hidden">
      <div class="form-designer-container">
        <!-- 顶部工具栏 -->
        <div class="designer-toolbar">
          <div class="toolbar-left">
            <Input v-model="formDesignerStore.currentForm.name" placeholder="请输入表单名称" class="form-name-input"
              style="width: 300px" />
          </div>

          <!-- 中间 Tab 切换 -->
          <div class="toolbar-center">
            <Tabs :value="activeTab" class="w-auto">
              <TabsList>
                <TabsTrigger value="design">表单设计</TabsTrigger>
                <TabsTrigger value="settings">表单设置</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div class="toolbar-right">
            <Button variant="default" @click="handleSave">
              <Icon icon="lucide:file-text" class="w-4 h-4 mr-2" />
              保存表单
            </Button>
            <Button variant="outline" @click="handleClose">
              <Icon icon="lucide:x" class="w-4 h-4 mr-2" />
              关闭
            </Button>
          </div>
        </div>

        <!-- 表单设计视图 -->
        <div v-show="activeTab === 'design'" class="designer-main">
          <!-- 左侧组件面板 -->
          <div class="designer-left">
            <div class="panel-header">
              <h3>组件库</h3>
            </div>
            <div class="panel-content">
              <ComponentsPanel />
            </div>
          </div>

          <!-- 中间设计画布 -->
          <div class="designer-center">
            <div class="canvas-header">
              <span>设计画布</span>
              <Badge v-if="formDesignerStore.currentForm.components.length > 0" variant="default">
                {{ formDesignerStore.currentForm.components.length }} 个组件
              </Badge>
              <Badge v-else variant="outline">空画布</Badge>
            </div>
            <DesignCanvas />
          </div>

          <!-- 右侧属性面板 -->
          <div class="designer-right">
            <div class="panel-header">
              <h3>属性配置</h3>
            </div>
            <div class="panel-content">
              <PropertiesPanel />
            </div>
          </div>
        </div>

        <!-- 表单设置视图 -->
        <div v-show="activeTab === 'settings'" class="designer-main settings-view">
          <div class="settings-container">
            <div class="settings-content">
              <!-- 系统按钮 -->
              <div class="settings-section">
                <div class="section-header">
                  <h4 class="section-title">系统按钮</h4>
                  <span class="section-desc">配置表单的系统按钮名称</span>
                </div>
                <div class="system-buttons-grid">
                  <div v-for="(btn, index) in systemButtons" :key="index" class="system-button-card">
                    <div class="button-label">
                      <Badge :variant="getBadgeVariant(btn.type)" size="sm">{{ btn.key }}</Badge>
                      <span class="button-desc">{{ btn.description }}</span>
                    </div>
                    <div class="button-controls">
                      <Input v-model="btn.label" placeholder="按钮名称" class="w-[150px]" size="sm" />
                      <Switch v-model="btn.visible" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 自定义按钮 -->
              <div class="settings-section">
                <div class="section-header">
                  <div>
                    <h4 class="section-title">自定义按钮</h4>
                    <span class="section-desc">添加自定义按钮并配置执行动作</span>
                  </div>
                  <Button variant="default" @click="handleAddCustomButton">
                    <Icon icon="lucide:plus" class="w-4 h-4 mr-2" />
                    添加按钮
                  </Button>
                </div>

                <div class="custom-buttons-grid">
                  <div v-for="(btn, index) in customButtons" :key="index" class="custom-button-card">
                    <div class="card-header">
                      <span class="card-title">自定义按钮 {{ index + 1 }}</span>
                      <Button variant="destructive" size="sm" @click="handleRemoveCustomButton(index)">
                        <Icon icon="lucide:trash-2" class="w-4 h-4" />
                      </Button>
                    </div>

                    <div class="card-body">
                      <div class="form-row">
                        <label class="form-label">按钮名称</label>
                        <Input v-model="btn.label" placeholder="请输入按钮名称" />
                      </div>

                      <div class="form-row">
                        <label class="form-label">背景颜色</label>
                        <div class="color-picker-wrapper">
                          <Input v-model="btn.color" type="color" class="w-[100px]" />
                          <span class="color-value">{{ btn.color }}</span>
                        </div>
                      </div>

                      <div class="form-row">
                        <label class="form-label">执行动作</label>
                        <div class="action-select-row">
                          <Select v-model="btn.actionId"
                            @update:model-value="(val) => handleActionChange({ ...btn, actionId: val }, index)"
                            class="flex-1">
                            <SelectTrigger>
                              <SelectValue placeholder="请选择动作" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem v-for="action in actionList" :key="action.id" :value="action.id">
                                {{ action.flowName }}
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Button v-if="btn.actionId" variant="default" @click="handleOpenParamsConfig(btn, index)">
                            <Icon icon="lucide:settings" class="w-4 h-4 mr-2" />
                            配置参数
                            <Badge v-if="btn.actionVariables && btn.actionVariables.length > 0"
                              :value="btn.actionVariables.length" class="params-badge" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="customButtons.length === 0" class="empty-state">
                    <Icon icon="lucide:button" class="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p class="text-center text-muted-foreground">暂无自定义按钮，点击上方按钮添加</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 参数配置对话框 -->
      <ActionParamsConfigDialog v-model="paramsConfigDialogVisible" :action-variables="currentButtonVariables"
        :form-fields="formDesignerStore.currentForm.components" @confirm="handleParamsConfigConfirm" />
    </DrawerContent>
  </Drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Drawer,
  DrawerContent,
} from '@/components/ui/drawer'
import { Icon } from '@/components/chronos-ui/Icon'
import { useFormDesignerStore } from '@/store/modules/formDesigner'
import ComponentsPanel from './ComponentsPanel.vue'
import DesignCanvas from './DesignCanvas.vue'
import PropertiesPanel from './PropertiesPanel.vue'
import ActionParamsConfigDialog from '../action-engine/ActionParamsConfigDialog.vue'
import { formApi } from '@/api'
import { actionEngineApi } from '@/api/actionEngine'

const formDesignerStore = useFormDesignerStore()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  formId: {
    type: [String, Number],
    default: null
  },
  formInfo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'saved', 'closed'])

const visible = ref(props.modelValue)

// Tab 切换
const activeTab = ref('design')

// 动作引擎列表
const actionList = ref([])

// 系统按钮配置
const systemButtons = ref([
  {
    key: '重置',
    label: '重置',
    type: 'default',
    description: '重置表单内容',
    action: 'reset',
    visible: true
  },
  {
    key: '提交',
    label: '提交',
    type: 'primary',
    description: '提交表单数据',
    action: 'submit',
    visible: true
  },
  {
    key: '取消',
    label: '取消',
    type: 'default',
    description: '取消操作',
    action: 'cancel',
    visible: true
  }
])

// 自定义按钮配置
const customButtons = ref([])

// 参数配置对话框
const paramsConfigDialogVisible = ref(false)
const currentButtonVariables = ref([])
const currentButtonIndex = ref(-1)

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
  if (newVal && props.formInfo) {
    loadFormConfig()
  }
})

// 监听 visible 变化，同步到父组件
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 监听 Tab 切换，加载对应数据
watch(activeTab, (newVal) => {
  if (newVal === 'settings') {
    loadButtonSettings()
    loadActionList()
  }
})

// 加载表单配置
const loadFormConfig = () => {
  try {
    console.log('=== FormDesignerDrawer 加载表单配置 ===')
    console.log('1. props.formInfo:', props.formInfo)
    console.log('2. formConfig 字符串:', props.formInfo.formConfig)

    // 先清空设计器状态
    formDesignerStore.clearForm()

    if (props.formInfo.formConfig) {
      const formConfig = JSON.parse(props.formInfo.formConfig)
      console.log('3. 解析后的 formConfig:', formConfig)
      console.log('4. formConfig.displayRules:', formConfig.displayRules)

      formDesignerStore.importForm({
        id: props.formInfo.id,
        name: props.formInfo.formName,
        description: props.formInfo.formDescription,
        ...formConfig
      })

      console.log('5. 导入后的 currentForm:', formDesignerStore.currentForm)
      console.log('6. 导入后的 displayRules:', formDesignerStore.currentForm.displayRules)
    } else {
      // 如果没有配置，只设置基本信息
      formDesignerStore.updateFormConfig({
        id: props.formInfo.id,
        name: props.formInfo.formName,
        description: props.formInfo.formDescription
      })
    }
  } catch (error) {
    console.error('加载表单配置失败:', error)
    toast.error('加载表单配置失败')
  }
}

// 加载按钮设置
const loadButtonSettings = () => {
  try {
    if (formDesignerStore.currentForm.settings && formDesignerStore.currentForm.settings.buttons) {
      const buttonSettings = formDesignerStore.currentForm.settings.buttons

      // 加载系统按钮设置
      if (buttonSettings.systemButtons && buttonSettings.systemButtons.length > 0) {
        systemButtons.value = buttonSettings.systemButtons
      }

      // 加载自定义按钮设置
      if (buttonSettings.customButtons && buttonSettings.customButtons.length > 0) {
        customButtons.value = buttonSettings.customButtons
      }
    }
  } catch (error) {
    console.error('加载按钮设置失败:', error)
  }
}

// 加载动作引擎列表
const loadActionList = async () => {
  try {
    console.log('[FormDesignerDrawer] 开始加载动作引擎列表')

    const params = {
      pageNum: 1,
      pageSize: 1000
    }

    // 如果 formInfo 中有 appId，则只加载当前应用下的动作
    if (props.formInfo && props.formInfo.appId) {
      params.appId = props.formInfo.appId
      console.log('[FormDesignerDrawer] 加载应用下的动作列表，appId:', props.formInfo.appId)
    }

    const response = await actionEngineApi.getActionList(params)

    console.log('[FormDesignerDrawer] 动作引擎API响应:', response)

    if (response.code === 200 && response.data) {
      actionList.value = response.data.records || response.data || []
      console.log('[FormDesignerDrawer] 加载的动作列表:', actionList.value)
      console.log('[FormDesignerDrawer] 动作列表数量:', actionList.value.length)

      if (actionList.value.length > 0) {
        console.log('[FormDesignerDrawer] 第一条动作数据:', actionList.value[0])
        console.log('[FormDesignerDrawer] 动作名称字段:', actionList.value[0].actionName)
        console.log('[FormDesignerDrawer] 所有字段:', Object.keys(actionList.value[0]))
      }

      if (actionList.value.length === 0 && params.appId) {
        console.log('[FormDesignerDrawer] 当前应用下没有动作')
      }
    } else {
      console.warn('[FormDesignerDrawer] 动作引擎API返回异常:', response)
    }
  } catch (error) {
    console.error('[FormDesignerDrawer] 加载动作列表失败:', error)
    toast.error('加载动作列表失败')
  }
}

// 添加自定义按钮
const handleAddCustomButton = () => {
  customButtons.value.push({
    label: '自定义按钮',
    color: '#409EFF',
    actionId: null
  })
}

// 删除自定义按钮
const handleRemoveCustomButton = (index) => {
  customButtons.value.splice(index, 1)
}

// 处理动作选择变化
const handleActionChange = async (btn, index) => {
  if (!btn.actionId) {
    btn.actionVariables = []
    return
  }

  try {
    console.log('[FormDesignerDrawer] 加载动作详情:', btn.actionId)
    const response = await actionEngineApi.getActionDetail(btn.actionId)

    if (response.code === 200 && response.data) {
      const actionDetail = response.data
      console.log('[FormDesignerDrawer] 动作详情:', actionDetail)

      // 解析 formConfig 获取变量定义
      let variables = []
      if (actionDetail.formConfig) {
        try {
          const formConfig = typeof actionDetail.formConfig === 'string'
            ? JSON.parse(actionDetail.formConfig)
            : actionDetail.formConfig

          console.log('[FormDesignerDrawer] 解析后的 formConfig:', formConfig)

          // 优先使用 variables（动作变量）
          if (formConfig && formConfig.variables && Array.isArray(formConfig.variables)) {
            variables = formConfig.variables
            console.log('[FormDesignerDrawer] 从 formConfig.variables 获取动作变量:', variables)
          }
          // 兼容旧格式：从 fields 读取
          else if (formConfig && formConfig.fields && Array.isArray(formConfig.fields)) {
            variables = formConfig.fields
            console.log('[FormDesignerDrawer] 从 formConfig.fields 获取动作变量（兼容模式）:', variables)
          }
        } catch (e) {
          console.error('[FormDesignerDrawer] 解析formConfig失败:', e)
        }
      }

      // 如果 formConfig 中没有，尝试从 flowConfig 中获取
      if (variables.length === 0 && actionDetail.flowConfig) {
        try {
          const flowConfig = typeof actionDetail.flowConfig === 'string'
            ? JSON.parse(actionDetail.flowConfig)
            : actionDetail.flowConfig

          variables = flowConfig.variables || []
          console.log('[FormDesignerDrawer] 从 flowConfig.variables 获取动作变量:', variables)
        } catch (e) {
          console.error('[FormDesignerDrawer] 解析flowConfig失败:', e)
        }
      }

      console.log('[FormDesignerDrawer] 最终获取的变量列表:', variables)

      // 初始化参数配置
      const actionVariables = variables.map(v => {
        // 映射字段类型
        let fieldType = 'text'
        const varType = (v.type || '').toLowerCase()

        if (varType === 'number' || varType === 'integer' || varType === 'int') {
          fieldType = 'number'
        } else if (varType === 'boolean' || varType === 'bool') {
          fieldType = 'boolean'
        } else if (varType === 'date') {
          fieldType = 'date'
        } else if (varType === 'datetime') {
          fieldType = 'datetime'
        } else if (varType === 'select' || varType === 'enum') {
          fieldType = 'select'
        } else if (varType === 'textarea') {
          fieldType = 'textarea'
        } else {
          fieldType = 'text'
        }

        return {
          name: v.name || v.key || v.field,
          label: v.label || v.title || v.name,
          type: fieldType,
          description: v.description || v.help || v.comment,
          bindType: 'field',
          value: v.defaultValue || v.default || '',
          options: v.options || v.enum || []
        }
      })

      console.log('[FormDesignerDrawer] 初始化参数配置:', actionVariables)

      // 使用 Vue 的响应式更新
      const btnIndex = customButtons.value.findIndex((b, i) => i === index)
      if (btnIndex !== -1) {
        customButtons.value[btnIndex].actionVariables = actionVariables
        customButtons.value = [...customButtons.value]
      }

      console.log('[FormDesignerDrawer] 更新后的按钮:', customButtons.value[btnIndex])
    }
  } catch (error) {
    console.error('[FormDesignerDrawer] 加载动作详情失败:', error)
    toast.error('加载动作参数失败')
  }
}

// 打开参数配置对话框
const handleOpenParamsConfig = (btn, index) => {
  currentButtonIndex.value = index
  currentButtonVariables.value = btn.actionVariables || []
  paramsConfigDialogVisible.value = true
}

// 确认参数配置
const handleParamsConfigConfirm = (variables) => {
  if (currentButtonIndex.value !== -1) {
    customButtons.value[currentButtonIndex.value].actionVariables = variables
    customButtons.value = [...customButtons.value]
    toast.success('参数配置已保存')
  }
}

// 保存表单设计
const handleSave = async () => {
  if (!formDesignerStore.currentForm.name.trim()) {
    toast.warning('请输入表单名称')
    return
  }

  if (formDesignerStore.currentForm.components.length === 0) {
    toast.warning('表单内容不能为空')
    return
  }

  try {
    console.log('=== FormDesignerDrawer 保存表单 - 开始 ===')
    console.log('1. currentForm 完整对象:', formDesignerStore.currentForm)
    console.log('2. currentForm.displayRules:', formDesignerStore.currentForm.displayRules)

    // 构造保存数据
    const formConfigObject = {
      labelWidth: formDesignerStore.currentForm.labelWidth,
      labelPosition: formDesignerStore.currentForm.labelPosition,
      size: formDesignerStore.currentForm.size,
      disabled: formDesignerStore.currentForm.disabled,
      inline: formDesignerStore.currentForm.inline,
      components: formDesignerStore.currentForm.components,
      style: formDesignerStore.currentForm.style,
      displayRules: formDesignerStore.currentForm.displayRules || [],
      settings: {
        ...formDesignerStore.currentForm.settings,
        buttons: {
          systemButtons: systemButtons.value,
          customButtons: customButtons.value
        }
      }
    }

    console.log('3. formConfigObject (序列化前):', formConfigObject)
    console.log('4. formConfigObject.displayRules:', formConfigObject.displayRules)

    const formConfigString = JSON.stringify(formConfigObject)
    console.log('5. formConfig (JSON字符串):', formConfigString)

    const formData = {
      id: props.formId,
      formName: formDesignerStore.currentForm.name,
      formDescription: formDesignerStore.currentForm.description || '',
      formConfig: formConfigString,
      status: 1
    }

    console.log('6. 完整保存数据 formData:', formData)
    console.log('7. formData.formConfig:', formData.formConfig)
    console.log('=== FormDesignerDrawer 保存表单 - 数据准备完成 ===')

    // 调用更新接口
    const response = await formApi.updateForm(formData)
    if (response.code === 200) {
      toast.success('表单保存成功')
      emit('saved', formData)
      handleClose()
    } else {
      toast.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存表单失败:', error)
    toast.error('保存表单失败')
  }
}

// 关闭抽屉
const handleClose = () => {
  visible.value = false
  activeTab.value = 'design'
  formDesignerStore.clearForm()
  emit('closed')
}

// 处理抽屉打开状态变化
const handleOpenChange = (open) => {
  emit('update:modelValue', open)
}
</script>

<style lang="scss" scoped>
.form-designer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  // background: var(--bg-secondary);

  .designer-toolbar {
    height: 56px;
    // background: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    flex-shrink: 0;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;

      .form-name-input {
        :deep(.input) {
          border: 1px dashed var(--border-color);
          // background: transparent;
          font-size: 16px;
          font-weight: 500;

          &:hover {
            border-color: var(--primary-color);
          }

          &:focus {
            border-color: var(--primary-color);
            border-style: solid;
          }
        }
      }
    }

    .toolbar-center {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
    }

    .toolbar-right {
      display: flex;
      gap: 12px;
      flex: 1;
      justify-content: flex-end;
    }
  }

  .designer-main {
    flex: 1;
    display: flex;
    overflow: hidden;

    .designer-left {
      width: 260px;
      // background: var(--bg-card);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .panel-header {
        padding: 16px;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;

        h3 {
          margin: 0;
          font-size: 14px;
          color: var(--text-primary);
        }
      }

      .panel-content {
        flex: 1;
        overflow-y: auto;
      }
    }

    .designer-center {
      flex: 1;
      // background: var(--bg-card);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .canvas-header {
        height: 50px;
        padding: 0 20px;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        gap: 12px;

        span {
          font-weight: 500;
          color: var(--text-primary);
        }
      }
    }

    .designer-right {
      width: 310px;
      // background: var(--bg-card);
      border-left: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .panel-header {
        padding: 16px;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;

        h3 {
          margin: 0;
          font-size: 14px;
          color: var(--text-primary);
        }
      }

      .panel-content {
        flex: 1;
        overflow-y: auto;
      }
    }
  }

  .settings-view {
    // background: var(--bg-secondary);
    overflow-y: auto;

    .settings-container {
      width: 100%;
      height: 100%;
      padding: 0;
    }

    .settings-content {
      // background: var(--bg-card);
      height: 100%;
      padding: 40px;

      .settings-section {
        margin-bottom: 48px;

        &:last-child {
          margin-bottom: 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;

          .section-title {
            margin: 0 0 4px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .section-desc {
            font-size: 13px;
            color: var(--text-secondary);
          }
        }

        .system-buttons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 16px;

          .system-button-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px;
            // background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            transition: all 0.3s;

            &:hover {
              border-color: var(--primary-color);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }

            .button-label {
              display: flex;
              align-items: center;
              gap: 12px;
              flex: 1;

              .button-desc {
                font-size: 14px;
                color: var(--text-secondary);
              }
            }

            .button-controls {
              display: flex;
              align-items: center;
              gap: 12px;
            }
          }
        }

        .custom-buttons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;

          .custom-button-card {
            // background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.3s;

            &:hover {
              border-color: var(--primary-color);
              box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
            }

            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16px 20px;
              // background: var(--bg-tertiary);
              border-bottom: 1px solid var(--border-color);

              .card-title {
                font-size: 14px;
                font-weight: 500;
                color: var(--text-primary);
              }
            }

            .card-body {
              padding: 20px;

              .form-row {
                margin-bottom: 20px;

                &:last-child {
                  margin-bottom: 0;
                }

                .form-label {
                  display: block;
                  margin-bottom: 8px;
                  font-size: 14px;
                  font-weight: 500;
                  color: var(--text-primary);
                }

                .action-select-row {
                  display: flex;
                  gap: 12px;
                  align-items: center;

                  .params-badge {
                    position: relative;
                    margin-left: 4px;
                  }
                }

                .color-picker-wrapper {
                  display: flex;
                  align-items: center;
                  gap: 12px;

                  .color-value {
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-family: monospace;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}
</style>
