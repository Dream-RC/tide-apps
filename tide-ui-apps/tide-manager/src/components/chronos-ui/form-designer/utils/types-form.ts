// 表单组件基础类型定义
export interface BaseFormComponent {
  id: string
  type: string
  label: string
  name: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  rules?: FormValidationRule[]
  style?: ComponentStyle
  // 栅格宽度（1-12），用于在设计画布上控制组件占位宽度
  span?: number
}

// 表单验证规则
export interface FormValidationRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change'
  type?: 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email'
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (rule: any, value: any, callback: any) => void
}

// 组件样式
export interface ComponentStyle {
  width?: string
  height?: string
  margin?: string
  padding?: string
  fontSize?: string
  color?: string
  backgroundColor?: string
  border?: string
  borderRadius?: string
}

// 输入框组件
export interface InputComponent extends BaseFormComponent {
  type: 'input'
  inputType?: 'text' | 'password' | 'textarea' | 'number'
  maxlength?: number
  minlength?: number
  showWordLimit?: boolean
  wordLimitPosition?: 'inside' | 'outside'
  clearable?: boolean
  showPassword?: boolean
  readonly?: boolean
  autosize?: boolean | { minRows?: number; maxRows?: number }
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  autofocus?: boolean
  prefixIcon?: string
  suffixIcon?: string
  size?: 'large' | 'default' | 'small'
  autocomplete?: string
  tabindex?: string | number
  validateEvent?: boolean
  inputStyle?: string | object
  inputmode?: string
  rows?: number
}

// 选择器组件
export interface SelectComponent extends BaseFormComponent {
  type: 'select'
  multiple?: boolean
  clearable?: boolean
  filterable?: boolean
  size?: 'large' | 'default' | 'small'
  collapseTags?: boolean
  collapseTagsTooltip?: boolean
  allowCreate?: boolean
  valueKey?: string
  popperClass?: string
  popperStyle?: string | object
  remote?: boolean
  reserveKeyword?: boolean
  defaultFirstOption?: boolean
  teleported?: boolean
  persistent?: boolean
  fitInputWidth?: boolean
  suffixIcon?: string
  clearIcon?: string
  validateEvent?: boolean
  options: SelectOption[]
}

// 选择器选项
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

// 单选框组件
export interface RadioComponent extends BaseFormComponent {
  type: 'radio'
  options: RadioOption[]
  buttonStyle?: boolean
  size?: 'large' | 'default' | 'small'
  textColor?: string
  fill?: string
  border?: boolean
}

// 单选框选项
export interface RadioOption {
  label: string
  value: string | number
  disabled?: boolean
}

// 多选框组件
export interface CheckboxComponent extends BaseFormComponent {
  type: 'checkbox'
  options: CheckboxOption[]
  min?: number
  max?: number
  size?: 'large' | 'default' | 'small'
  textColor?: string
  fill?: string
  border?: boolean
  indeterminate?: boolean
  trueValue?: string | number
  falseValue?: string | number
}

// 多选框选项
export interface CheckboxOption {
  label: string
  value: string | number
  disabled?: boolean
}

// 日期选择器组件
export interface DatePickerComponent extends BaseFormComponent {
  type: 'date-picker'
  pickerType?: 'date' | 'datetime' | 'daterange' | 'datetimerange' | 'month' | 'year'
  format?: string
  valueFormat?: string
  clearable?: boolean
  editable?: boolean
  size?: 'large' | 'default' | 'small'
  startPlaceholder?: string
  endPlaceholder?: string
  defaultValue?: Date | string | number
  defaultTime?: Date | string | number | Array<Date | string | number>
  popperClass?: string
  popperStyle?: string | object
  popperOptions?: object
  unlinkPanels?: boolean
  cellClassName?: string | ((date: Date) => string)
  shortcuts?: Array<{ text: string; value: Date | Function }>
  teleported?: boolean
  appendTo?: string | HTMLElement
  readonly?: boolean
  validateEvent?: boolean
}

// 时间选择器组件
export interface TimePickerComponent extends BaseFormComponent {
  type: 'time-picker'
  format?: string
  valueFormat?: string
  clearable?: boolean
  editable?: boolean
  isRange?: boolean
  size?: 'large' | 'default' | 'small'
  startPlaceholder?: string
  endPlaceholder?: string
  defaultValue?: Date | string | number | Array<Date | string | number>
  arrowControl?: boolean
  popperClass?: string
  popperStyle?: string | object
  teleported?: boolean
  appendTo?: string | HTMLElement
  readonly?: boolean
  validateEvent?: boolean
}

// 数字输入框组件
export interface InputNumberComponent extends BaseFormComponent {
  type: 'input-number' | 'number'
  min?: number
  max?: number
  step?: number
  precision?: number
  controls?: boolean
  controlsPosition?: 'right' | ''
  readonly?: boolean
  size?: 'large' | 'default' | 'small'
  stepStrictly?: boolean
  validateEvent?: boolean
}

// 滑块组件
export interface SliderComponent extends BaseFormComponent {
  type: 'slider'
  min?: number
  max?: number
  step?: number
  showInput?: boolean
  showStops?: boolean
  range?: boolean
  marks?: Record<number, string>
  vertical?: boolean
  height?: string
  showInputControls?: boolean
  size?: 'large' | 'default' | 'small'
  inputSize?: 'large' | 'default' | 'small'
  showTooltip?: boolean
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end'
  tooltipClass?: string
  debounce?: number
  validateEvent?: boolean
}

// 上传组件
export interface UploadComponent extends BaseFormComponent {
  type: 'upload'
  action?: string
  multiple?: boolean
  limit?: number
  fileList?: any[]
  accept?: string
  listType?: 'text' | 'picture' | 'picture-card'
  autoUpload?: boolean
  showFileList?: boolean
  headers?: Record<string, string>
  method?: 'post' | 'put' | 'patch'
  data?: Record<string, any> | ((rawFile: any) => Record<string, any>)
  withCredentials?: boolean
  drag?: boolean
  crossorigin?: 'anonymous' | 'use-credentials'
  directory?: boolean
}


// 容器组件基础接口
export interface ContainerComponent extends BaseFormComponent {
  children: FormComponent[]
}

// 页签项
export interface TabItem {
  label: string
  name: string
  children: FormComponent[]
}

// 栅格列
export interface GridColumn {
  span: number
  children: FormComponent[]
}

// 布局容器组件
export interface LayoutContainerComponent extends ContainerComponent {
  type: 'layout-container'
  showBorder?: boolean
  showBackground?: boolean
  padding?: string
  margin?: string
  backgroundColor?: string
  borderColor?: string
  borderRadius?: string
  minHeight?: string
}

// 页签容器组件
export interface TabsContainerComponent extends ContainerComponent {
  type: 'tabs-container'
  tabs: TabItem[]
  activeTab?: string
  // Element Plus el-tabs 属性
  tabType?: 'card' | 'border-card' | '' // 标签页类型
  tabPosition?: 'top' | 'right' | 'bottom' | 'left' // 标签位置
  stretch?: boolean // 标签宽度是否自撑开
  closable?: boolean // 标签是否可关闭
  addable?: boolean // 标签是否可增加
  editable?: boolean // 标签是否同时可增加和关闭
  // 间距设置
  padding?: string // 内边距
  margin?: string // 外边距
}

// 栅格容器组件
export interface GridContainerComponent extends ContainerComponent {
  type: 'grid-container'
  columns: GridColumn[]
  gutter?: number
  // Element Plus el-row 属性
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' // 水平排列方式
  align?: 'top' | 'middle' | 'bottom' // 垂直对齐方式
  // 间距设置
  padding?: string // 内边距
  margin?: string // 外边距
}

// 人员选择组件
export interface UserSelectComponent extends BaseFormComponent {
  type: 'user-select'
  multiple?: boolean
  clearable?: boolean
  filterable?: boolean
  size?: 'large' | 'default' | 'small'
}

// 部门选择组件
export interface DepartmentSelectComponent extends BaseFormComponent {
  type: 'department-select'
  multiple?: boolean
  clearable?: boolean
  filterable?: boolean
  checkStrictly?: boolean
  size?: 'large' | 'default' | 'small'
}

// 角色选择组件
export interface RoleSelectComponent extends BaseFormComponent {
  type: 'role-select'
  multiple?: boolean
  clearable?: boolean
  filterable?: boolean
  size?: 'large' | 'default' | 'small'
}

// 联合类型：所有表单组件
export type FormComponent = 
  | InputComponent 
  | SelectComponent 
  | RadioComponent 
  | CheckboxComponent 
  | DatePickerComponent 
  | TimePickerComponent 
  | InputNumberComponent 
  | SliderComponent 
  | UploadComponent 
  | UserSelectComponent
  | DepartmentSelectComponent
  | RoleSelectComponent
  | LayoutContainerComponent
  | TabsContainerComponent
  | GridContainerComponent

// 表单配置
export interface FormConfig {
  id: string
  name: string
  description?: string
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  inline?: boolean
  components: FormComponent[]
  style?: ComponentStyle
  displayRules?: any[] // 动态显示规则
}

// 组件分类
export interface ComponentCategory {
  name: string
  label: string
  icon: string
  components: ComponentType[]
}

// 组件类型信息
export interface ComponentType {
  type: string
  label: string
  icon: string
  defaultProps: Partial<FormComponent>
}