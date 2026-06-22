import { defineStore } from "pinia";

import { getComponentDefault } from "@/components/chronos-ui/form-designer/utils/components";
import type {
  FormComponent,
  FormConfig,
  GridContainerComponent,
  LayoutContainerComponent,
  TabsContainerComponent,
} from "@/components/chronos-ui/form-designer/utils/types-form";

export const useFormDesignerStore = defineStore("formDesigner", () => {
  // 当前表单配置
  const currentForm = reactive<FormConfig>({
    id: "",
    name: "未命名表单",
    description: "",
    labelWidth: "120px",
    labelPosition: "right",
    size: "default",
    disabled: false,
    inline: false,
    components: [],
    style: {},
    settings: {
      systemButtons: [
        {
          key: "reset",
          label: "重置",
          type: "default",
          description: "重置表单内容",
          visible: true,
          action: "reset",
        },
        {
          key: "submit",
          label: "保存",
          type: "primary",
          description: "提交表单数据",
          visible: true,
          action: "submit",
        },
      ],
      customButtons: [],
      formSettings: {
        width: "100%",
        buttonAlign: "right",
      },
    },
  });

  // 选中的组件ID
  const selectedComponentId = ref<string>("");

  // 拖拽状态
  const dragState = reactive({
    isDragging: false,
    dragComponent: null as FormComponent | null,
    dragOverIndex: -1,
  });

  // 历史记录
  const history = reactive({
    undoStack: [] as string[],
    redoStack: [] as string[],
    maxHistorySize: 50,
  });

  // 计算属性
  const selectedComponent = computed(() => {
    if (!selectedComponentId.value) return null;
    // 使用 findComponent 递归查找组件（包括容器内的子组件）
    return findComponent(selectedComponentId.value) || null;
  });

  const hasComponents = computed(() => {
    return currentForm.components.length > 0;
  });

  const canUndo = computed(() => {
    return history.undoStack.length > 0;
  });

  const canRedo = computed(() => {
    return history.redoStack.length > 0;
  });

  // 方法

  // 添加组件
  const addComponent = (componentType: string, index?: number) => {
    console.log("开始添加组件:", {
      componentType,
      index,
      当前组件数: currentForm.components.length,
    });

    try {
      const newComponent = getComponentDefault(componentType) as FormComponent;
      console.log("新组件已创建:", newComponent);

      // 确保组件数组是响应式的
      if (
        typeof index === "number" && index >= 0 &&
        index <= currentForm.components.length
      ) {
        currentForm.components.splice(index, 0, newComponent);
        console.log(`组件已插入到位置 ${index}`);
      } else {
        currentForm.components.push(newComponent);
        console.log("组件已添加到末尾");
      }

      // 验证添加是否成功
      const finalCount = currentForm.components.length;
      const addedComponent = currentForm.components.find((c) =>
        c.id === newComponent.id
      );
      console.log("添加验证:", {
        组件数: finalCount,
        找到新组件: !!addedComponent,
      });

      if (!addedComponent) {
        throw new Error("组件添加失败：未找到新添加的组件");
      }

      selectComponent(newComponent.id);
      saveToHistory();

      console.log("组件添加完成，当前组件数:", currentForm.components.length);
      console.log("当前组件ID列表:", currentForm.components.map((c) => c.id));

      return newComponent;
    } catch (error) {
      console.error("添加组件失败:", error);
      throw error;
    }
  };

  // 递归删除容器及其所有子组件
  const removeContainerChildren = (container: FormComponent) => {
    if ("children" in container && container.children) {
      container.children.forEach((child) => {
        removeContainerChildren(child);
      });
    }
    if ("tabs" in container && (container as TabsContainerComponent).tabs) {
      (container as TabsContainerComponent).tabs.forEach((tab) => {
        tab.children.forEach((child) => {
          removeContainerChildren(child);
        });
      });
    }
    if (
      "columns" in container && (container as GridContainerComponent).columns
    ) {
      (container as GridContainerComponent).columns.forEach((column) => {
        column.children.forEach((child) => {
          removeContainerChildren(child);
        });
      });
    }
  };

  // 删除组件
  const removeComponent = (componentId: string) => {
    const component = currentForm.components.find((comp) =>
      comp.id === componentId
    );
    if (component) {
      // 如果是容器组件，递归删除所有子组件
      removeContainerChildren(component);
    }

    const index = currentForm.components.findIndex((comp) =>
      comp.id === componentId
    );
    if (index > -1) {
      currentForm.components.splice(index, 1);
      if (selectedComponentId.value === componentId) {
        selectedComponentId.value = "";
      }
      saveToHistory();
    }
  };

  // 递归复制组件及其子组件
  const deepCloneComponent = (component: FormComponent): FormComponent => {
    const cloned = JSON.parse(JSON.stringify(component));
    cloned.id = `component_${Date.now()}_${
      Math.random().toString(36).substr(2, 9)
    }`;
    cloned.name = `${component.name}_copy`;

    // 递归复制子组件
    if ("children" in cloned && cloned.children) {
      cloned.children = cloned.children.map((child: FormComponent) =>
        deepCloneComponent(child)
      );
    }
    if ("tabs" in cloned && cloned.tabs) {
      cloned.tabs = cloned.tabs.map((tab: any) => ({
        ...tab,
        children: tab.children.map((child: FormComponent) =>
          deepCloneComponent(child)
        ),
      }));
    }
    if ("columns" in cloned && cloned.columns) {
      cloned.columns = cloned.columns.map((column: any) => ({
        ...column,
        children: column.children.map((child: FormComponent) =>
          deepCloneComponent(child)
        ),
      }));
    }

    return cloned;
  };

  // 复制组件
  const duplicateComponent = (componentId: string) => {
    const component = currentForm.components.find((comp) =>
      comp.id === componentId
    );
    if (component) {
      const newComponent = deepCloneComponent(component);

      const index = currentForm.components.findIndex((comp) =>
        comp.id === componentId
      );
      currentForm.components.splice(index + 1, 0, newComponent);
      selectComponent(newComponent.id);
      saveToHistory();
      return newComponent;
    }
  };

  // 移动组件
  const moveComponent = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= currentForm.components.length) {
      return;
    }
    // 先取出元素
    const item = currentForm.components.splice(fromIndex, 1)[0];
    // 如果从前往后移动，移除后目标索引需要 -1
    let insertIndex = toIndex;
    if (fromIndex < toIndex) insertIndex = toIndex - 1;
    // 允许插入到末尾（等于当前长度）
    insertIndex = Math.max(
      0,
      Math.min(insertIndex, currentForm.components.length),
    );
    currentForm.components.splice(insertIndex, 0, item);
    saveToHistory();
  };

  // 更新组件属性
  const updateComponent = (
    componentId: string,
    updates: Partial<FormComponent>,
  ) => {
    const component = currentForm.components.find((comp) =>
      comp.id === componentId
    );
    if (component) {
      Object.assign(component, updates);
      saveToHistory();
    } else {
      // 使用 findComponent 递归查找组件（包括容器内的组件）
      const foundComponent = findComponent(componentId);
      if (foundComponent) {
        Object.assign(foundComponent, updates);
        saveToHistory();
      }
    }
  };

  // 选中组件
  const selectComponent = (componentId: string) => {
    console.log('selectComponent called with componentId:', componentId);
    selectedComponentId.value = componentId;
    console.log('selectedComponentId updated to:', selectedComponentId.value);
  };

  // 清空选择
  const clearSelection = () => {
    selectedComponentId.value = "";
  };

  // 清空表单
  const clearForm = () => {
    currentForm.components = [];
    selectedComponentId.value = "";
    saveToHistory();
  };

  // 更新表单配置
  const updateFormConfig = (updates: Partial<FormConfig>) => {
    console.log("updateFormConfig 被调用，更新内容:", updates);
    Object.assign(currentForm, updates);
    console.log("updateFormConfig 更新后的 currentForm:", currentForm);
    console.log(
      "updateFormConfig 更新后的 displayRules:",
      (currentForm as any).displayRules,
    );
    saveToHistory();
  };

  // 更新表单设置（按钮配置等）
  const updateFormSettings = (settings: any) => {
    if (!currentForm.settings) {
      currentForm.settings = {
        systemButtons: [],
        customButtons: [],
        formSettings: {},
      };
    }
    Object.assign(currentForm.settings, settings);
    saveToHistory();
  };

  // 设置拖拽状态
  const setDragState = (
    isDragging: boolean,
    component?: FormComponent | null,
    overIndex?: number,
  ) => {
    dragState.isDragging = isDragging;
    dragState.dragComponent = component || null;
    dragState.dragOverIndex = overIndex ?? -1;
  };

  // 保存到历史记录
  const saveToHistory = () => {
    const currentState = JSON.stringify({
      form: currentForm,
      selectedComponentId: selectedComponentId.value,
    });

    history.undoStack.push(currentState);

    // 限制历史记录大小
    if (history.undoStack.length > history.maxHistorySize) {
      history.undoStack.shift();
    }

    // 清空重做栈
    history.redoStack = [];
  };

  // 撤销
  const undo = () => {
    if (history.undoStack.length > 0) {
      // 保存当前状态到重做栈
      const currentState = JSON.stringify({
        form: currentForm,
        selectedComponentId: selectedComponentId.value,
      });
      history.redoStack.push(currentState);

      // 恢复上一个状态
      const previousState = history.undoStack.pop()!;
      const parsed = JSON.parse(previousState);

      Object.assign(currentForm, parsed.form);
      selectedComponentId.value = parsed.selectedComponentId;
    }
  };

  // 重做
  const redo = () => {
    if (history.redoStack.length > 0) {
      // 保存当前状态到撤销栈
      const currentState = JSON.stringify({
        form: currentForm,
        selectedComponentId: selectedComponentId.value,
      });
      history.undoStack.push(currentState);

      // 恢复重做状态
      const nextState = history.redoStack.pop()!;
      const parsed = JSON.parse(nextState);

      Object.assign(currentForm, parsed.form);
      selectedComponentId.value = parsed.selectedComponentId;
    }
  };

  // 导入表单配置
  const importForm = (formConfig: FormConfig) => {
    Object.assign(currentForm, formConfig);
    selectedComponentId.value = "";
    saveToHistory();
  };

  // 导出表单配置
  const exportForm = (): FormConfig => {
    return JSON.parse(JSON.stringify(currentForm));
  };

  // 生成表单JSON
  const generateFormJSON = () => {
    return JSON.stringify(currentForm, null, 2);
  };

  // 生成Vue组件代码
  const generateVueCode = () => {
    const template = generateTemplate();
    const script = generateScript();
    const style = generateStyle();

    return `<template>
${template}
</template>

<script setup lang="ts">
${script}
</script>

<style scoped>
${style}
</style>`;
  };

  // 生成模板代码
  const generateTemplate = () => {
    const formProps = [
      `:model="form"`,
      `label-width="${currentForm.labelWidth}"`,
      `label-position="${currentForm.labelPosition}"`,
      `size="${currentForm.size}"`,
      currentForm.disabled ? "disabled" : "",
      currentForm.inline ? "inline" : "",
    ].filter(Boolean).join(" ");

    let template = `  <el-form ${formProps}>\n`;

    currentForm.components.forEach((component) => {
      const formItemProps = [
        `label="${component.label}"`,
        `prop="${component.name}"`,
        component.required ? "required" : "",
      ].filter(Boolean).join(" ");

      template += `    <el-form-item ${formItemProps}>\n`;
      template += generateComponentTemplate(component);
      template += `    </el-form-item>\n`;
    });

    template += `    <el-form-item>\n`;
    template +=
      `      <el-button type="primary" @click="onSubmit">提交</el-button>\n`;
    template += `      <el-button @click="onReset">重置</el-button>\n`;
    template += `    </el-form-item>\n`;
    template += `  </el-form>`;

    return template;
  };

  // 生成组件模板
  const generateComponentTemplate = (component: FormComponent): string => {
    switch (component.type) {
      case "input":
        const inputProps = [
          `v-model="form.${component.name}"`,
          component.placeholder ? `placeholder="${component.placeholder}"` : "",
          component.disabled ? "disabled" : "",
        ].filter(Boolean).join(" ");
        return `      <el-input ${inputProps} />\n`;

      case "select":
        const selectProps = [
          `v-model="form.${component.name}"`,
          component.placeholder ? `placeholder="${component.placeholder}"` : "",
          component.disabled ? "disabled" : "",
        ].filter(Boolean).join(" ");
        return `      <el-select ${selectProps}>\n        <!-- 选项需要根据配置添加 -->\n      </el-select>\n`;

      default:
        return `      <!-- ${component.type} 组件 -->\n`;
    }
  };

  // 生成脚本代码
  const generateScript = () => {
    const formFields = currentForm.components.reduce((acc, comp) => {
      acc[comp.name] = "";
      return acc;
    }, {} as Record<string, any>);

    return `import { ref } from 'vue'

const form = ref(${JSON.stringify(formFields, null, 2)})

const onSubmit = () => {
  console.log('表单数据:', form.value)
}

const onReset = () => {
  form.value = ${JSON.stringify(formFields, null, 2)}
}`;
  };

  // 生成样式代码
  const generateStyle = () => {
    return `/* 表单样式 */`;
  };

  // 初始化表单
  const initForm = () => {
    currentForm.id = `form_${Date.now()}`;
    currentForm.name = "新建表单";
    saveToHistory();
  };

  // 容器组件相关方法

  // 查找组件（支持在容器中递归查找）
  const findComponent = (
    componentId: string,
    components: FormComponent[] = currentForm.components,
  ): FormComponent | null => {
    for (const comp of components) {
      if (comp.id === componentId) {
        return comp;
      }
      if ("children" in comp && comp.children) {
        const found = findComponent(componentId, comp.children);
        if (found) return found;
      }
      if ("tabs" in comp && (comp as TabsContainerComponent).tabs) {
        for (const tab of (comp as TabsContainerComponent).tabs) {
          const found = findComponent(componentId, tab.children);
          if (found) return found;
        }
      }
      if ("columns" in comp && (comp as GridContainerComponent).columns) {
        for (const column of (comp as GridContainerComponent).columns) {
          const found = findComponent(componentId, column.children);
          if (found) return found;
        }
      }
    }
    return null;
  };

  // 向容器添加子组件
  const addChildToContainer = (
    containerId: string,
    componentType: string,
    index?: number,
  ) => {
    const container = findComponent(containerId);
    if (!container) {
      throw new Error(`容器组件 ${containerId} 不存在`);
    }

    const newComponent = getComponentDefault(componentType) as FormComponent;

    if (container.type === "layout-container") {
      const layoutContainer = container as LayoutContainerComponent;
      if (!layoutContainer.children) {
        layoutContainer.children = [];
      }
      if (
        typeof index === "number" && index >= 0 &&
        index <= layoutContainer.children.length
      ) {
        layoutContainer.children.splice(index, 0, newComponent);
      } else {
        layoutContainer.children.push(newComponent);
      }
    } else if (container.type === "tabs-container") {
      const tabsContainer = container as TabsContainerComponent;
      const activeTab = tabsContainer.tabs.find((tab) =>
        tab.name === tabsContainer.activeTab
      ) || tabsContainer.tabs[0];
      if (activeTab) {
        if (!activeTab.children) {
          activeTab.children = [];
        }
        if (
          typeof index === "number" && index >= 0 &&
          index <= activeTab.children.length
        ) {
          activeTab.children.splice(index, 0, newComponent);
        } else {
          activeTab.children.push(newComponent);
        }
      }
    } else if (container.type === "grid-container") {
      const gridContainer = container as GridContainerComponent;
      // 默认添加到第一列
      const firstColumn = gridContainer.columns[0];
      if (firstColumn) {
        if (!firstColumn.children) {
          firstColumn.children = [];
        }
        if (
          typeof index === "number" && index >= 0 &&
          index <= firstColumn.children.length
        ) {
          firstColumn.children.splice(index, 0, newComponent);
        } else {
          firstColumn.children.push(newComponent);
        }
      }
    }

    selectComponent(newComponent.id);
    saveToHistory();
    return newComponent;
  };

  // 向指定列添加子组件
  const addChildToGridColumn = (
    containerId: string,
    columnIndex: number,
    componentType: string,
    index?: number,
  ) => {
    const container = findComponent(containerId) as GridContainerComponent;
    if (!container || container.type !== "grid-container") {
      throw new Error(`栅格容器 ${containerId} 不存在`);
    }

    const column = container.columns[columnIndex];
    if (!column) {
      throw new Error(`列索引 ${columnIndex} 不存在`);
    }

    const newComponent = getComponentDefault(componentType) as FormComponent;
    if (!column.children) {
      column.children = [];
    }
    if (
      typeof index === "number" && index >= 0 && index <= column.children.length
    ) {
      column.children.splice(index, 0, newComponent);
    } else {
      column.children.push(newComponent);
    }

    selectComponent(newComponent.id);
    saveToHistory();
    return newComponent;
  };

  // 向指定标签页添加子组件
  const addChildToTab = (
    containerId: string,
    tabName: string,
    componentType: string,
    index?: number,
  ) => {
    const container = findComponent(containerId) as TabsContainerComponent;
    if (!container || container.type !== "tabs-container") {
      throw new Error(`页签容器 ${containerId} 不存在`);
    }

    const tab = container.tabs.find((t) => t.name === tabName);
    if (!tab) {
      throw new Error(`标签页 ${tabName} 不存在`);
    }

    const newComponent = getComponentDefault(componentType) as FormComponent;
    if (!tab.children) {
      tab.children = [];
    }
    if (
      typeof index === "number" && index >= 0 && index <= tab.children.length
    ) {
      tab.children.splice(index, 0, newComponent);
    } else {
      tab.children.push(newComponent);
    }

    selectComponent(newComponent.id);
    saveToHistory();
    return newComponent;
  };

  // 从容器删除子组件
  const removeChildFromContainer = (containerId: string, childId: string) => {
    const container = findComponent(containerId);
    if (!container) return;

    const removeFromArray = (children: FormComponent[]) => {
      const index = children.findIndex((c) => c.id === childId);
      if (index > -1) {
        children.splice(index, 1);
        return true;
      }
      return false;
    };

    if (container.type === "layout-container") {
      const layoutContainer = container as LayoutContainerComponent;
      if (layoutContainer.children) {
        removeFromArray(layoutContainer.children);
      }
    } else if (container.type === "tabs-container") {
      const tabsContainer = container as TabsContainerComponent;
      for (const tab of tabsContainer.tabs) {
        if (tab.children && removeFromArray(tab.children)) {
          break;
        }
      }
    } else if (container.type === "grid-container") {
      const gridContainer = container as GridContainerComponent;
      for (const column of gridContainer.columns) {
        if (column.children && removeFromArray(column.children)) {
          break;
        }
      }
    }

    if (selectedComponentId.value === childId) {
      selectedComponentId.value = "";
    }
    saveToHistory();
  };

  // 查找组件的父容器或主区域
  // 返回值：{ parent: FormComponent | null, location: 'main' | 'layout' | 'tab' | 'grid', tabName?: string, columnIndex?: number, childIndex?: number }
  const findComponentParent = (
    componentId: string,
  ): {
    parent: FormComponent | null;
    location: "main" | "layout" | "tab" | "grid";
    tabName?: string;
    columnIndex?: number;
    childIndex?: number;
  } | null => {
    // 先检查是否在主区域
    const mainIndex = currentForm.components.findIndex((comp) =>
      comp.id === componentId
    );
    if (mainIndex > -1) {
      return { parent: null, location: "main", childIndex: mainIndex };
    }

    // 递归查找容器
    const findInContainer = (
      container: FormComponent,
      parent: FormComponent | null = null,
    ): {
      parent: FormComponent;
      location: "layout" | "tab" | "grid";
      tabName?: string;
      columnIndex?: number;
      childIndex?: number;
    } | null => {
      // 检查布局容器的子组件
      if ("children" in container && container.children) {
        const childIndex = container.children.findIndex((child) =>
          child.id === componentId
        );
        if (childIndex > -1) {
          return { parent: container, location: "layout", childIndex };
        }
        // 递归查找子容器
        for (const child of container.children) {
          const found = findInContainer(child, container);
          if (found) return found;
        }
      }

      // 检查页签容器
      if ("tabs" in container && (container as TabsContainerComponent).tabs) {
        const tabsContainer = container as TabsContainerComponent;
        for (const tab of tabsContainer.tabs) {
          const childIndex = tab.children.findIndex((child) =>
            child.id === componentId
          );
          if (childIndex > -1) {
            return {
              parent: container,
              location: "tab",
              tabName: tab.name,
              childIndex,
            };
          }
          // 递归查找子容器
          for (const child of tab.children) {
            const found = findInContainer(child, container);
            if (found) return found;
          }
        }
      }

      // 检查栅格容器
      if (
        "columns" in container && (container as GridContainerComponent).columns
      ) {
        const gridContainer = container as GridContainerComponent;
        for (
          let colIndex = 0;
          colIndex < gridContainer.columns.length;
          colIndex++
        ) {
          const column = gridContainer.columns[colIndex];
          const childIndex = column.children.findIndex((child) =>
            child.id === componentId
          );
          if (childIndex > -1) {
            return {
              parent: container,
              location: "grid",
              columnIndex: colIndex,
              childIndex,
            };
          }
          // 递归查找子容器
          for (const child of column.children) {
            const found = findInContainer(child, container);
            if (found) return found;
          }
        }
      }

      return null;
    };

    // 在主区域的组件中查找容器
    for (const comp of currentForm.components) {
      if (
        ["layout-container", "tabs-container", "grid-container"].includes(
          comp.type,
        )
      ) {
        const found = findInContainer(comp);
        if (found) return found;
      }
    }

    return null;
  };

  // 在容器内移动子组件
  const moveChildInContainer = (
    containerId: string,
    fromIndex: number,
    toIndex: number,
  ) => {
    const container = findComponent(containerId);
    if (!container) {
      return;
    }

    const moveInArray = (children: FormComponent[]) => {
      if (fromIndex < 0 || fromIndex >= children.length) {
        return;
      }
      const item = children.splice(fromIndex, 1)[0];
      let insertIndex = toIndex;
      if (fromIndex < toIndex) insertIndex = toIndex - 1;
      insertIndex = Math.max(0, Math.min(insertIndex, children.length));
      children.splice(insertIndex, 0, item);
    };

    if (container.type === "layout-container") {
      const layoutContainer = container as LayoutContainerComponent;
      if (layoutContainer.children) {
        moveInArray(layoutContainer.children);
      }
    } else if (container.type === "tabs-container") {
      const tabsContainer = container as TabsContainerComponent;
      const activeTab = tabsContainer.tabs.find((tab) =>
        tab.name === tabsContainer.activeTab
      ) || tabsContainer.tabs[0];
      if (activeTab && activeTab.children) {
        moveInArray(activeTab.children);
      }
    } else if (container.type === "grid-container") {
      const gridContainer = container as GridContainerComponent;
      const firstColumn = gridContainer.columns[0];
      if (firstColumn && firstColumn.children) {
        moveInArray(firstColumn.children);
      }
    }

    saveToHistory();
  };

  // 将已存在的组件移动到容器中
  const moveComponentToContainer = (
    componentId: string,
    containerId: string,
    index?: number,
    columnIndex?: number,
  ) => {
    const component = findComponent(componentId);
    if (!component) {
      throw new Error(`组件 ${componentId} 不存在`);
    }

    const targetContainer = findComponent(containerId);
    if (!targetContainer) {
      throw new Error(`容器 ${containerId} 不存在`);
    }

    if (
      !["layout-container", "tabs-container", "grid-container"].includes(
        targetContainer.type,
      )
    ) {
      throw new Error(`目标不是容器组件`);
    }

    // 查找组件的当前位置
    const parentInfo = findComponentParent(componentId);
    if (!parentInfo) {
      throw new Error(`无法找到组件 ${componentId} 的父级`);
    }

    // 从原位置移除组件
    if (parentInfo.location === "main") {
      // 从主区域移除
      const mainIndex = currentForm.components.findIndex((comp) =>
        comp.id === componentId
      );
      if (mainIndex > -1) {
        currentForm.components.splice(mainIndex, 1);
      }
    } else if (parentInfo.location === "layout") {
      // 从布局容器移除
      const layoutContainer = parentInfo.parent as LayoutContainerComponent;
      if (
        layoutContainer.children && typeof parentInfo.childIndex === "number"
      ) {
        layoutContainer.children.splice(parentInfo.childIndex, 1);
      }
    } else if (parentInfo.location === "tab") {
      // 从页签容器移除
      const tabsContainer = parentInfo.parent as TabsContainerComponent;
      const tab = tabsContainer.tabs.find((t) => t.name === parentInfo.tabName);
      if (tab && typeof parentInfo.childIndex === "number") {
        tab.children.splice(parentInfo.childIndex, 1);
      }
    } else if (parentInfo.location === "grid") {
      // 从栅格容器移除
      const gridContainer = parentInfo.parent as GridContainerComponent;
      if (
        typeof parentInfo.columnIndex === "number" &&
        typeof parentInfo.childIndex === "number"
      ) {
        const column = gridContainer.columns[parentInfo.columnIndex];
        if (column && column.children) {
          column.children.splice(parentInfo.childIndex, 1);
        }
      }
    }

    // 添加到目标容器
    if (targetContainer.type === "layout-container") {
      const layoutContainer = targetContainer as LayoutContainerComponent;
      if (!layoutContainer.children) {
        layoutContainer.children = [];
      }
      if (
        typeof index === "number" && index >= 0 &&
        index <= layoutContainer.children.length
      ) {
        layoutContainer.children.splice(index, 0, component);
      } else {
        layoutContainer.children.push(component);
      }
    } else if (targetContainer.type === "tabs-container") {
      const tabsContainer = targetContainer as TabsContainerComponent;
      const activeTab = tabsContainer.tabs.find((tab) =>
        tab.name === tabsContainer.activeTab
      ) || tabsContainer.tabs[0];
      if (activeTab) {
        if (!activeTab.children) {
          activeTab.children = [];
        }
        if (
          typeof index === "number" && index >= 0 &&
          index <= activeTab.children.length
        ) {
          activeTab.children.splice(index, 0, component);
        } else {
          activeTab.children.push(component);
        }
      }
    } else if (targetContainer.type === "grid-container") {
      const gridContainer = targetContainer as GridContainerComponent;
      if (
        typeof columnIndex === "number" && columnIndex >= 0 &&
        columnIndex < gridContainer.columns.length
      ) {
        const column = gridContainer.columns[columnIndex];
        if (!column.children) {
          column.children = [];
        }
        if (
          typeof index === "number" && index >= 0 &&
          index <= column.children.length
        ) {
          column.children.splice(index, 0, component);
        } else {
          column.children.push(component);
        }
      } else {
        // 默认添加到第一列
        const firstColumn = gridContainer.columns[0];
        if (firstColumn) {
          if (!firstColumn.children) {
            firstColumn.children = [];
          }
          if (
            typeof index === "number" && index >= 0 &&
            index <= firstColumn.children.length
          ) {
            firstColumn.children.splice(index, 0, component);
          } else {
            firstColumn.children.push(component);
          }
        }
      }
    }

    selectComponent(componentId);
    saveToHistory();
  };

  // 向页签容器添加标签页
  const addTabToTabsContainer = (containerId: string, tabLabel?: string) => {
    const container = findComponent(containerId) as TabsContainerComponent;
    if (!container || container.type !== "tabs-container") {
      throw new Error(`页签容器 ${containerId} 不存在`);
    }

    const tabCount = container.tabs.length;
    const newTab = {
      label: tabLabel || `标签页${tabCount + 1}`,
      name: `tab${Date.now()}`,
      children: [],
    };

    container.tabs.push(newTab);
    container.activeTab = newTab.name;
    saveToHistory();
    return newTab;
  };

  // 从页签容器删除标签页
  const removeTabFromTabsContainer = (containerId: string, tabName: string) => {
    const container = findComponent(containerId) as TabsContainerComponent;
    if (!container || container.type !== "tabs-container") return;

    if (container.tabs.length <= 1) {
      throw new Error("至少需要保留一个标签页");
    }

    const index = container.tabs.findIndex((tab) => tab.name === tabName);
    if (index > -1) {
      container.tabs.splice(index, 1);
      if (container.activeTab === tabName) {
        container.activeTab = container.tabs[0]?.name;
      }
      saveToHistory();
    }
  };

  // 向栅格容器添加列
  const addColumnToGridContainer = (containerId: string, span?: number) => {
    const container = findComponent(containerId) as GridContainerComponent;
    if (!container || container.type !== "grid-container") {
      throw new Error(`栅格容器 ${containerId} 不存在`);
    }

    const totalSpan = container.columns.reduce((sum, col) => sum + col.span, 0);
    const remainingSpan = 24 - totalSpan;
    const newSpan = span || Math.min(12, remainingSpan);

    if (totalSpan + newSpan > 24) {
      throw new Error("列宽度总和不能超过 24");
    }

    container.columns.push({
      span: newSpan,
      children: [],
    });
    saveToHistory();
  };

  // 从栅格容器删除列
  const removeColumnFromGridContainer = (
    containerId: string,
    columnIndex: number,
  ) => {
    const container = findComponent(containerId) as GridContainerComponent;
    if (!container || container.type !== "grid-container") return;

    if (container.columns.length <= 1) {
      throw new Error("至少需要保留一列");
    }

    if (columnIndex >= 0 && columnIndex < container.columns.length) {
      container.columns.splice(columnIndex, 1);
      saveToHistory();
    }
  };

  // 获取所有组件（包括容器内的子组件）
  const getAllComponents = (): FormComponent[] => {
    const components: FormComponent[] = [];

    const collectComponents = (comps: FormComponent[]) => {
      for (const comp of comps) {
        components.push(comp);

        // 递归收集容器内的子组件
        if (
          comp.type === "layout-container" && "children" in comp &&
          comp.children
        ) {
          collectComponents(comp.children);
        } else if (
          comp.type === "tabs-container" && "tabs" in comp && comp.tabs
        ) {
          for (const tab of comp.tabs) {
            if (tab.children) {
              collectComponents(tab.children);
            }
          }
        } else if (
          comp.type === "grid-container" && "columns" in comp && comp.columns
        ) {
          for (const column of comp.columns) {
            if (column.children) {
              collectComponents(column.children);
            }
          }
        }
      }
    };

    collectComponents(currentForm.components);
    return components;
  };

  return {
    // 状态
    currentForm,
    selectedComponentId,
    dragState,
    history,

    // 计算属性
    selectedComponent,
    hasComponents,
    canUndo,
    canRedo,

    // 方法
    addComponent,
    removeComponent,
    duplicateComponent,
    moveComponent,
    updateComponent,
    selectComponent,
    clearSelection,
    clearForm,
    updateFormConfig,
    updateFormSettings,
    setDragState,
    saveToHistory,
    undo,
    redo,
    importForm,
    exportForm,
    generateFormJSON,
    generateVueCode,
    initForm,

    // 容器组件方法
    findComponent,
    findComponentParent,
    getAllComponents,
    addChildToContainer,
    addChildToGridColumn,
    addChildToTab,
    removeChildFromContainer,
    moveChildInContainer,
    moveComponentToContainer,
    addTabToTabsContainer,
    removeTabFromTabsContainer,
    addColumnToGridContainer,
    removeColumnFromGridContainer,
  };
});
