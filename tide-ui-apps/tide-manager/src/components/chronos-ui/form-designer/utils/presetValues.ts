/**
 * 预设值配置
 */
const PRESETS = {
  padding: ['0px', '8px', '12px', '16px', '20px', '24px'],
  margin: ['0px', '8px', '12px', '16px', '20px', '24px'],
  borderRadius: ['0px', '4px', '8px', '12px', '16px'],
  minHeight: ['auto', '60px', '100px', '150px', '200px']
} as const

/**
 * 检查值是否为预设值
 * @param value 要检查的值
 * @param presets 预设值数组
 * @returns 是否为预设值
 */
function isPresetValue(value: string, presets: readonly string[]): boolean {
  return presets.includes(value)
}

/**
 * 获取 padding 预设值
 * @param value 当前值
 * @returns 预设值或 'custom'
 */
export function getPaddingPreset(value: string): string {
  return isPresetValue(value, PRESETS.padding) ? value : 'custom'
}

/**
 * 获取 margin 预设值
 * @param value 当前值
 * @returns 预设值或 'custom'
 */
export function getMarginPreset(value: string): string {
  return isPresetValue(value, PRESETS.margin) ? value : 'custom'
}

/**
 * 获取 borderRadius 预设值
 * @param value 当前值
 * @returns 预设值或 'custom'
 */
export function getBorderRadiusPreset(value: string): string {
  return isPresetValue(value, PRESETS.borderRadius) ? value : 'custom'
}

/**
 * 获取 minHeight 预设值
 * @param value 当前值
 * @returns 预设值或 'custom'
 */
export function getMinHeightPreset(value: string): string {
  return isPresetValue(value, PRESETS.minHeight) ? value : 'custom'
}

/**
 * 获取预设值选项列表
 * @param type 预设值类型
 * @returns 预设值数组
 */
export function getPresetOptions(type: 'padding' | 'margin' | 'borderRadius' | 'minHeight'): string[] {
  return [...PRESETS[type]]
}
