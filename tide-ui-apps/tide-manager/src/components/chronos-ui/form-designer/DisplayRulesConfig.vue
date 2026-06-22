<template>
  <div class="display-rules-config">
    <div class="rules-header">
      <span class="rules-title">规则配置</span>
      <Button variant="default" size="sm" @click="addRule">
        添加规则
      </Button>
    </div>

    <div v-if="!rules || rules.length === 0" class="empty-rules">
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p class="empty-description">暂无显示规则，点击上方按钮添加</p>
      </div>
    </div>

    <div v-else class="rules-list">
      <div
        v-for="(rule, index) in rules"
        :key="index"
        class="rule-item"
      >
        <div class="rule-header">
          <span class="rule-index">规则 {{ index + 1 }}</span>
          <Button variant="destructive" size="sm" @click="removeRule(index)">
            删除
          </Button>
        </div>

        <div class="rule-form">
          <!-- 字段（触发字段） -->
          <div class="form-field">
            <Label class="form-label">字段</Label>
            <Select :model-value="rule.triggerField" @update:model-value="updateRule(index, 'triggerField', $event)">
              <SelectTrigger>
                <SelectValue placeholder="选择字段" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="field in availableFields.filter(f => f.name !== rule.targetField)"
                  :key="field.name"
                  :value="field.name"
                >
                  {{ field.label }} ({{ field.name }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 条件类型 -->
          <div class="form-field">
            <Label class="form-label">条件</Label>
            <Select :model-value="rule.condition" @update:model-value="updateRule(index, 'condition', $event)">
              <SelectTrigger>
                <SelectValue placeholder="选择条件" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eq">等于</SelectItem>
                <SelectItem value="neq">不等于</SelectItem>
                <SelectItem value="contains">包含</SelectItem>
                <SelectItem value="notContains">不包含</SelectItem>
                <SelectItem value="gt">大于</SelectItem>
                <SelectItem value="lt">小于</SelectItem>
                <SelectItem value="gte">大于等于</SelectItem>
                <SelectItem value="lte">小于等于</SelectItem>
                <SelectItem value="empty">为空</SelectItem>
                <SelectItem value="notEmpty">不为空</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 比较值 -->
          <div v-if="!['empty', 'notEmpty'].includes(rule.condition)" class="form-field">
            <Label class="form-label">比较值</Label>
            <div class="value-input-group">
              <RadioGroup :model-value="rule.valueType || 'static'" @update:model-value="updateRule(index, 'valueType', $event)" class="flex space-x-2">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="static" id="static-{{index}}" />
                  <Label for="static-{{index}}">静态值</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="field" id="field-{{index}}" />
                  <Label for="field-{{index}}">字段值</Label>
                </div>
              </RadioGroup>

              <Input
                v-if="rule.valueType === 'static' || !rule.valueType"
                :model-value="rule.value"
                @update:model-value="updateRule(index, 'value', $event)"
                placeholder="输入比较值"
                class="mt-2"
              />

              <Select
                v-else
                :model-value="rule.value"
                @update:model-value="updateRule(index, 'value', $event)"
                class="mt-2"
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择字段" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="field in availableFields.filter(f => f.name !== rule.targetField)"
                    :key="field.name"
                    :value="field.name"
                  >
                    {{ field.label }} ({{ field.name }})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- 执行动作 -->
          <div class="form-field">
            <Label class="form-label">执行动作</Label>
            <Select :model-value="rule.action" @update:model-value="updateRule(index, 'action', $event)">
              <SelectTrigger>
                <SelectValue placeholder="选择动作" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="show">显示</SelectItem>
                <SelectItem value="hide">隐藏</SelectItem>
                <SelectItem value="enable">启用</SelectItem>
                <SelectItem value="disable">禁用</SelectItem>
                <SelectItem value="required">设为必填</SelectItem>
                <SelectItem value="notRequired">设为非必填</SelectItem>
                <SelectItem value="readonly">设为只读</SelectItem>
                <SelectItem value="editable">设为可编辑</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 目标字段 -->
          <div class="form-field">
            <Label class="form-label">目标字段</Label>
            <Select :model-value="rule.targetField" @update:model-value="updateRule(index, 'targetField', $event)">
              <SelectTrigger>
                <SelectValue placeholder="选择要控制的字段" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="field in availableFields"
                  :key="field.name"
                  :value="field.name"
                >
                  {{ field.label }} ({{ field.name }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 逻辑关系（多条规则时） -->
          <div v-if="index < rules.length - 1" class="form-field">
            <Label class="form-label">与下一条</Label>
            <RadioGroup :model-value="rule.logic || 'and'" @update:model-value="updateRule(index, 'logic', $event)" class="flex space-x-2">
              <div class="flex items-center space-x-2">
                <RadioGroupItem value="and" id="and-{{index}}" />
                <Label for="and-{{index}}">且</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroupItem value="or" id="or-{{index}}" />
                <Label for="or-{{index}}">或</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormDesignerStore } from '@/store/modules/formDesigner'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface DisplayRule {
  targetField: string
  triggerField: string
  condition: string
  value?: any
  valueType?: 'static' | 'field'
  action: string
  logic?: 'and' | 'or'
}

const props = defineProps<{
  componentId: string
  rules?: DisplayRule[]
}>()

const emit = defineEmits<{
  (e: 'update:rules', rules: DisplayRule[]): void
}>()

const formDesignerStore = useFormDesignerStore()

// 获取所有可用字段
const availableFields = computed(() => {
  const allComponents = formDesignerStore.getAllComponents()
  return allComponents
    .filter(comp => comp.name && !['layout-container', 'tabs-container', 'grid-container'].includes(comp.type))
    .map(comp => ({
      name: comp.name,
      label: comp.label || comp.name,
      type: comp.type
    }))
})

// 添加规则
const addRule = () => {
  const newRule: DisplayRule = {
    targetField: '',
    triggerField: '',
    condition: 'eq',
    value: '',
    valueType: 'static',
    action: 'show',
    logic: 'and'
  }

  const updatedRules = [...(props.rules || []), newRule]
  console.log('DisplayRulesConfig - 添加规则:', newRule)
  console.log('DisplayRulesConfig - 更新后的规则列表:', updatedRules)
  emit('update:rules', updatedRules)
}

// 删除规则
const removeRule = (index: number) => {
  const updatedRules = [...(props.rules || [])]
  updatedRules.splice(index, 1)
  console.log('DisplayRulesConfig - 删除规则后:', updatedRules)
  emit('update:rules', updatedRules)
}

// 更新规则
const updateRule = (index: number, field: string, value: any) => {
  const updatedRules = [...(props.rules || [])]
  if (updatedRules[index]) {
    (updatedRules[index] as any)[field] = value
    console.log(`DisplayRulesConfig - 更新规则 ${index} 的 ${field}:`, value)
    console.log('DisplayRulesConfig - 更新后的规则:', updatedRules[index])
    emit('update:rules', updatedRules)
  }
}
</script>

<style scoped>
.display-rules-config {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.rules-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}

.empty-rules {
  padding: 20px 0;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-icon {
  font-size: 32px;
  opacity: 0.5;
}

.empty-description {
  font-size: 14px;
  color: var(--text-muted);
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.rule-index {
  font-weight: 600;
  font-size: 13px;
  color: var(--primary-color);
}

.rule-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.value-input-group {
  width: 100%;
}

:deep(.form-field .form-label) {
  margin-bottom: 4px;
}

:deep(.form-field .select-trigger) {
  width: 100%;
}

:deep(.form-field .input) {
  width: 100%;
}

:deep(.form-field .radio-group) {
  display: flex;
  gap: 16px;
}

:deep(.form-field .radio-group-item) {
  margin-right: 8px;
}

:deep(.form-field .radio-group-item ~ label) {
  margin-left: 4px;
}
</style>
