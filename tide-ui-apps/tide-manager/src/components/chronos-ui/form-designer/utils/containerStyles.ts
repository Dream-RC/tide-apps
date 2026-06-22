import type { LayoutContainerComponent, GridContainerComponent } from '@/types/form'

/**
 * 获取布局容器样式
 * @param container 布局容器组件配置
 * @returns 样式对象
 */
export function getLayoutContainerStyle(container: LayoutContainerComponent): Record<string, string> {
  const style: Record<string, string> = {}
  
  if (container.showBackground !== false) {
    style.backgroundColor = container.backgroundColor || 'var(--background)'
  } else {
    style.backgroundColor = 'transparent'
  }
  
  if (container.showBorder !== false) {
    style.border = `1px dashed ${container.borderColor || 'var(--border-0)'}`
  } else {
    style.border = 'none'
  }
  
  if (container.padding) {
    style.padding = container.padding
  }
  
  if (container.margin) {
    style.margin = container.margin
  }
  
  if (container.borderRadius) {
    style.borderRadius = container.borderRadius
  }
  
  if (container.minHeight) {
    style.minHeight = container.minHeight
  }
  
  return style
}

/**
 * 获取栅格容器样式
 * @param container 栅格容器组件配置
 * @returns 样式对象
 */
export function getGridContainerStyle(container: GridContainerComponent): Record<string, string> {
  const style: Record<string, string> = {
    display: 'flex',
    width: '100%',
    flexWrap: 'nowrap',
    gap: `${container.gutter || 20}px`
  }
  
  // 处理 justify（水平排列方式）
  const justifyMap: Record<string, string> = {
    'start': 'flex-start',
    'end': 'flex-end',
    'center': 'center',
    'space-around': 'space-around',
    'space-between': 'space-between'
  }
  style.justifyContent = justifyMap[container.justify || 'start'] || 'flex-start'
  
  // 处理 align（垂直对齐方式）
  const alignMap: Record<string, string> = {
    'top': 'flex-start',
    'middle': 'center',
    'bottom': 'flex-end'
  }
  style.alignItems = alignMap[container.align || 'top'] || 'flex-start'
  
  return style
}

/**
 * 获取栅格列样式
 * @param span 列占用的栅格数
 * @param totalColumns 总列数
 * @param gutter 间距值（像素）
 * @returns 样式对象
 */
export function getGridColumnStyle(span: number, totalColumns: number, gutter: number): Record<string, string> {
  // 总共有 (totalColumns - 1) 个间距
  const totalGap = gutter * (totalColumns - 1)
  // 先减去总间距，再按比例分配
  const width = `calc(${(span / 24) * 100}% - ${(span / 24) * totalGap}px)`
  const style: Record<string, string> = {
    flex: `0 0 ${width}`,
    width: width
  }
  return style
}
