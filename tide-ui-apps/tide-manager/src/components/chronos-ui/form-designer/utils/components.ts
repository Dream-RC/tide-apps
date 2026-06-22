import type {
  ComponentCategory,
  ComponentType,
} from "@/components/chronos-ui/form-designer/utils/types-form";

// 组件默认配置
export const componentDefaults: Record<string, Partial<any>> = {
  input: {
    type: "input",
    label: "输入框",
    name: "",
    placeholder: "请输入内容",
    required: false,
    disabled: false,
    clearable: true,
    inputType: "text",
    maxlength: undefined,
    minlength: undefined,
    showWordLimit: false,
    wordLimitPosition: "inside",
    showPassword: false,
    readonly: false,
    autosize: false,
    resize: undefined,
    autofocus: false,
    prefixIcon: undefined,
    suffixIcon: undefined,
    size: undefined,
    autocomplete: "off",
    tabindex: undefined,
    validateEvent: true,
    inputStyle: {},
    inputmode: undefined,
    icon: "input",
    defaultValue: "",
    span: 12,
  },

  textarea: {
    type: "textarea",
    label: "多行文本",
    name: "",
    placeholder: "请输入内容",
    required: false,
    disabled: false,
    inputType: "textarea",
    rows: 4,
    autosize: false,
    resize: undefined,
    showWordLimit: false,
    wordLimitPosition: "inside",
    readonly: false,
    autofocus: false,
    icon: "textarea",
    defaultValue: "",
    span: 12,
  },

  select: {
    type: "select",
    label: "下拉选择",
    name: "",
    placeholder: "请选择",
    required: false,
    disabled: false,
    clearable: true,
    filterable: false,
    multiple: false,
    size: undefined,
    collapseTags: false,
    collapseTagsTooltip: false,
    allowCreate: false,
    valueKey: "value",
    popperClass: undefined,
    popperStyle: undefined,
    remote: false,
    reserveKeyword: false,
    defaultFirstOption: false,
    teleported: true,
    persistent: true,
    fitInputWidth: true,
    suffixIcon: undefined,
    clearIcon: undefined,
    validateEvent: true,
    options: [
      { label: "选项1", value: "1" },
      { label: "选项2", value: "2" },
    ],
    icon: "ArrowDown",
    defaultValue: "",
    span: 12,
  },

  radio: {
    type: "radio",
    label: "单选框",
    name: "",
    required: false,
    disabled: false,
    buttonStyle: false,
    size: undefined,
    textColor: undefined,
    fill: undefined,
    border: false,
    options: [
      { label: "选项1", value: "1" },
      { label: "选项2", value: "2" },
    ],
    icon: "CircleCheck",
    defaultValue: "",
    span: 12,
  },

  checkbox: {
    type: "checkbox",
    label: "多选框",
    name: "",
    required: false,
    disabled: false,
    size: undefined,
    textColor: undefined,
    fill: undefined,
    border: false,
    indeterminate: false,
    trueValue: undefined,
    falseValue: undefined,
    options: [
      { label: "选项1", value: "1" },
      { label: "选项2", value: "2" },
    ],
    icon: "Select",
    defaultValue: [],
    span: 12,
  },

  "date-picker": {
    type: "date-picker",
    label: "日期选择",
    name: "",
    placeholder: "请选择日期",
    required: false,
    disabled: false,
    clearable: true,
    editable: true,
    pickerType: "date",
    format: "YYYY-MM-DD",
    valueFormat: "YYYY-MM-DD",
    size: undefined,
    startPlaceholder: undefined,
    endPlaceholder: undefined,
    defaultValue: undefined,
    defaultTime: undefined,
    popperClass: undefined,
    popperStyle: undefined,
    popperOptions: undefined,
    unlinkPanels: false,
    cellClassName: undefined,
    shortcuts: undefined,
    teleported: true,
    appendTo: undefined,
    readonly: false,
    validateEvent: true,
    icon: "Calendar",
    span: 12,
  },

  "time-picker": {
    type: "time-picker",
    label: "时间选择",
    name: "",
    placeholder: "请选择时间",
    required: false,
    disabled: false,
    clearable: true,
    editable: true,
    format: "HH:mm:ss",
    valueFormat: "HH:mm:ss",
    size: undefined,
    startPlaceholder: undefined,
    endPlaceholder: undefined,
    defaultValue: undefined,
    arrowControl: false,
    popperClass: undefined,
    popperStyle: undefined,
    teleported: true,
    appendTo: undefined,
    readonly: false,
    validateEvent: true,
    icon: "Clock",
    span: 12,
  },

  "number": {
    type: "number",
    label: "数字输入",
    name: "",
    required: false,
    disabled: false,
    controls: true,
    controlsPosition: "right",
    min: undefined,
    max: undefined,
    step: 1,
    precision: undefined,
    readonly: false,
    size: undefined,
    stepStrictly: false,
    validateEvent: true,
    icon: "Plus",
    defaultValue: 0,
    span: 12,
  },

  slider: {
    type: "slider",
    label: "滑块",
    name: "",
    required: false,
    disabled: false,
    min: 0,
    max: 100,
    step: 1,
    showInput: false,
    showStops: false,
    range: false,
    vertical: false,
    height: undefined,
    showInputControls: true,
    size: undefined,
    inputSize: undefined,
    showTooltip: true,
    placement: "top",
    tooltipClass: undefined,
    debounce: 300,
    validateEvent: true,
    icon: "Minus",
    defaultValue: 0,
    span: 12,
  },

  upload: {
    type: "upload",
    label: "文件上传",
    name: "",
    required: false,
    disabled: false,
    multiple: false,
    limit: 1,
    accept: "",
    listType: "text",
    autoUpload: true,
    showFileList: true,
    action: "#",
    headers: undefined,
    method: "post",
    data: undefined,
    withCredentials: false,
    drag: false,
    crossorigin: undefined,
    directory: false,
    icon: "upload",
    defaultValue: [],
    span: 12,
  },

  // 业务组件
  "user-select": {
    type: "user-select",
    label: "人员选择",
    name: "",
    placeholder: "请选择人员",
    required: false,
    disabled: false,
    clearable: true,
    filterable: true,
    multiple: false,
    size: undefined,
    icon: "User",
    defaultValue: "",
    span: 12,
  },

  "department-select": {
    type: "department-select",
    label: "部门选择",
    name: "",
    placeholder: "请选择部门",
    required: false,
    disabled: false,
    clearable: true,
    filterable: true,
    multiple: false,
    checkStrictly: true, // 是否可以选择任意级别
    size: undefined,
    icon: "OfficeBuilding",
    defaultValue: "",
    span: 12,
  },

  "role-select": {
    type: "role-select",
    label: "角色选择",
    name: "",
    placeholder: "请选择角色",
    required: false,
    disabled: false,
    clearable: true,
    filterable: true,
    multiple: false,
    size: undefined,
    icon: "UserFilled",
    defaultValue: "",
    span: 12,
  },

  // 容器组件
  "layout-container": {
    type: "layout-container",
    label: "布局容器",
    name: "",
    required: false,
    disabled: false,
    icon: "layout",
    children: [],
    showBorder: true,
    showBackground: true,
    padding: "12px",
    margin: "0px",
    backgroundColor: "",
    borderColor: "",
    borderRadius: "4px",
    minHeight: "60px",
  },

  "tabs-container": {
    type: "tabs-container",
    label: "页签容器",
    name: "",
    required: false,
    disabled: false,
    icon: "tabs",
    children: [],
    tabs: [
      { label: "标签页1", name: "tab1", children: [] },
    ],
    activeTab: "tab1",
    // Element Plus el-tabs 属性默认值
    tabType: "", // 默认普通类型
    tabPosition: "top", // 默认顶部
    stretch: false, // 默认不自撑开
    closable: false, // 默认不可关闭
    addable: false, // 默认不可增加
    editable: false, // 默认不可编辑
    // 间距设置
    padding: "0px", // 默认内边距
    margin: "0px", // 默认外边距
  },

  "grid-container": {
    type: "grid-container",
    label: "栅格容器",
    name: "",
    required: false,
    disabled: false,
    icon: "grid",
    children: [],
    columns: [
      { span: 12, children: [] },
    ],
    gutter: 20,
    // Element Plus el-row 属性默认值
    justify: "start", // 默认左对齐
    align: "top", // 默认顶部对齐
    // 间距设置
    padding: "0px", // 默认内边距
    margin: "0px", // 默认外边距
  },
};

// 组件分类配置
export const componentCategories: ComponentCategory[] = [
  {
    name: "basic",
    label: "基础组件",
    icon: "caidan",
    components: [
      {
        type: "input",
        label: "输入框",
        icon: "input",
        defaultProps: componentDefaults.input,
      },
      {
        type: "textarea",
        label: "多行文本",
        icon: "textarea",
        defaultProps: componentDefaults.textarea,
      },
    ],
  },
  {
    name: "advanced",
    label: "高级组件",
    icon: "xitongshezhi",
    components: [
      {
        type: "upload",
        label: "文件上传",
        icon: "upload",
        defaultProps: componentDefaults.upload,
      },
    ],
  },
  {
    name: "container",
    label: "容器组件",
    icon: "zhuangtai",
    components: [
      {
        type: "layout-container",
        label: "布局容器",
        icon: "layout",
        defaultProps: componentDefaults["layout-container"],
      },
      {
        type: "tabs-container",
        label: "页签容器",
        icon: "tabs",
        defaultProps: componentDefaults["tabs-container"],
      },
      {
        type: "grid-container",
        label: "栅格容器",
        icon: "grid",
        defaultProps: componentDefaults["grid-container"],
      },
    ],
  },
  // {
  //   name: 'business',
  //   label: '业务组件',
  //   icon: 'business',
  //   components: [
  //   ]
  // }
];

// 获取组件默认配置
export const getComponentDefault = (type: string) => {
  const defaults = componentDefaults[type];
  if (!defaults) {
    console.error(
      `组件类型 ${type} 不存在，可用的类型:`,
      Object.keys(componentDefaults),
    );
    throw new Error(`Unknown component type: ${type}`);
  }

  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5); // 缩短随机后缀到5位

  // 字段名中的 - 转换为 _，确保字段名合法
  const safeType = type.replace(/-/g, "_");

  // 字段名控制在25个字符以内，格式: {type}_{random}
  const fieldName = `${safeType}_${random}`.substring(0, 25);

  const newComponent = {
    ...JSON.parse(JSON.stringify(defaults)), // 深度克隆防止引用问题
    id: `component_${timestamp}_${random}`,
    name: fieldName, // 简短字段名，最多15字符
    label: `${defaults.label}_${Math.floor(Math.random() * 1000)}`,
  };

  return newComponent;
};

// 获取所有组件类型
export const getAllComponentTypes = (): ComponentType[] => {
  return componentCategories.reduce((acc, category) => {
    return acc.concat(category.components);
  }, [] as ComponentType[]);
};

// 根据类型获取组件信息
export const getComponentTypeInfo = (
  type: string,
): ComponentType | undefined => {
  const allTypes = getAllComponentTypes();
  return allTypes.find((item) => item.type === type);
};
