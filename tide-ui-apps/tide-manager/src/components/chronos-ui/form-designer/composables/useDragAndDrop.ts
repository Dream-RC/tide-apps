/**
 * 拖拽状态接口
 */
export interface DragState {
  draggingIndex: Ref<number | null>;
  dragOverIndex: Ref<number>;
  isInternalDragging: Ref<boolean>;
  isDragOver: Ref<boolean>;
  isDropping: Ref<boolean>;
}

/**
 * 拖拽 composable
 * 提供通用的拖拽状态管理和辅助函数
 */
export function useDragAndDrop() {
  // 拖拽状态
  const draggingIndex = ref<number | null>(null);
  const dragOverIndex = ref(-1);
  const isInternalDragging = ref(false);
  const isDragOver = ref(false);
  const isDropping = ref(false);

  /**
   * 重置拖拽状态
   */
  const resetDragState = () => {
    draggingIndex.value = null;
    dragOverIndex.value = -1;
    isInternalDragging.value = false;
    isDragOver.value = false;
    isDropping.value = false;
  };

  /**
   * 开始拖拽
   */
  const startDrag = (index: number, event: DragEvent) => {
    draggingIndex.value = index;
    isInternalDragging.value = true;
    event.stopPropagation();
    event.dataTransfer?.setData("text/plain", `${index}`);
    event.dataTransfer?.setData("internal-reorder", "1");
    event.dataTransfer!.effectAllowed = "move";
  };

  /**
   * 结束拖拽
   */
  const endDrag = () => {
    draggingIndex.value = null;
    isInternalDragging.value = false;
  };

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = (event: DragEvent, index: number, options?: {
    beforeThreshold?: number;
    allowDrop?: boolean;
  }) => {
    const { beforeThreshold = 0.5, allowDrop = true } = options || {};

    if (!allowDrop || draggingIndex.value === null) return;

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer && (event.dataTransfer.dropEffect = "move");

    // 根据鼠标位置决定插入到该项之前还是之后
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const before = offsetY < rect.height * beforeThreshold;
    dragOverIndex.value = before ? index : index + 1;
  };

  /**
   * 检查是否是内部排序拖拽
   */
  const isInternalReorder = (event: DragEvent): boolean => {
    return event.dataTransfer?.getData("internal-reorder") === "1";
  };

  /**
   * 获取拖拽的索引
   */
  const getDraggedIndex = (event: DragEvent): number | null => {
    const index = event.dataTransfer?.getData("text/plain");
    return index !== null && index !== undefined ? parseInt(index, 10) : null;
  };

  /**
   * 检查是否有组件类型数据
   */
  const hasComponentType = (event: DragEvent): boolean => {
    return event.dataTransfer?.types.includes("componentType") ||
      event.dataTransfer?.types.includes("text/plain") || false;
  };

  /**
   * 获取组件类型
   */
  const getComponentType = (event: DragEvent): string | null => {
    return event.dataTransfer?.getData("componentType") || null;
  };

  return {
    // 状态
    draggingIndex,
    dragOverIndex,
    isInternalDragging,
    isDragOver,
    isDropping,

    // 方法
    resetDragState,
    startDrag,
    endDrag,
    handleDragOver,
    isInternalReorder,
    getDraggedIndex,
    hasComponentType,
    getComponentType,
  };
}
