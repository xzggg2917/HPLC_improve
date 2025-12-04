/**
 * 统一的颜色分级系统
 * 用于所有绿色化学评分可视化
 * 
 * 规则：分数越低越绿（越环保），越高越红（越不环保）
 * 分为5个区间，区间内渐变，区间间有明显变化
 */

// 颜色断点定义
export const COLOR_BREAKPOINTS = {
  // 分数断点
  SCORES: [0, 20, 40, 60, 80, 100],
  
  // 对应颜色（RGB格式，便于插值）- 注意：0分最绿，100分最红
  COLORS: [
    { r: 46, g: 125, b: 50 },   // 0分: 深绿色 #2e7d32 (最环保)
    { r: 129, g: 199, b: 132 }, // 20分: 浅绿色 #81c784
    { r: 255, g: 213, b: 79 },  // 40分: 黄色 #ffd54f
    { r: 255, g: 152, b: 0 },   // 60分: 橙色 #ff9800
    { r: 244, g: 67, b: 54 },   // 80分: 红色 #f44336
    { r: 211, g: 47, b: 47 }    // 100分: 深红色 #d32f2f (最不环保)
  ],
  
  // HEX格式（用于CSS）
  COLORS_HEX: [
    '#2e7d32', // 0分: 深绿 (最环保)
    '#81c784', // 20分: 浅绿
    '#ffd54f', // 40分: 黄色
    '#ff9800', // 60分: 橙色
    '#f44336', // 80分: 红色
    '#d32f2f'  // 100分: 深红 (最不环保)
  ]
}

// 颜色等级名称（可选，用于提示）
export const COLOR_GRADES = {
  EXCELLENT: { range: [0, 20], label: '优秀', color: '#2e7d32' },
  GOOD: { range: [20, 40], label: '良好', color: '#81c784' },
  AVERAGE: { range: [40, 60], label: '中等', color: '#ffd54f' },
  POOR: { range: [60, 80], label: '较差', color: '#ff9800' },
  VERY_POOR: { range: [80, 100], label: '很差', color: '#d32f2f' }
}

/**
 * 线性插值函数
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * RGB转HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * 根据分数获取颜色（RGB格式）
 * @param score 分数 (0-100)
 * @returns RGB颜色对象 {r, g, b}
 */
export function getColorRGB(score: number): { r: number; g: number; b: number } {
  // 边界处理
  if (score <= 0) return COLOR_BREAKPOINTS.COLORS[0]
  if (score >= 100) return COLOR_BREAKPOINTS.COLORS[5]
  
  // 找到所在区间
  let segmentIndex = 0
  for (let i = 0; i < COLOR_BREAKPOINTS.SCORES.length - 1; i++) {
    if (score >= COLOR_BREAKPOINTS.SCORES[i] && score < COLOR_BREAKPOINTS.SCORES[i + 1]) {
      segmentIndex = i
      break
    }
  }
  
  // 计算区间内的位置比例
  const segmentStart = COLOR_BREAKPOINTS.SCORES[segmentIndex]
  const segmentEnd = COLOR_BREAKPOINTS.SCORES[segmentIndex + 1]
  const t = (score - segmentStart) / (segmentEnd - segmentStart)
  
  // 在两个颜色之间插值
  const colorStart = COLOR_BREAKPOINTS.COLORS[segmentIndex]
  const colorEnd = COLOR_BREAKPOINTS.COLORS[segmentIndex + 1]
  
  return {
    r: lerp(colorStart.r, colorEnd.r, t),
    g: lerp(colorStart.g, colorEnd.g, t),
    b: lerp(colorStart.b, colorEnd.b, t)
  }
}

/**
 * 根据分数获取颜色（HEX格式）
 * @param score 分数 (0-100)
 * @returns HEX颜色字符串 #RRGGBB
 */
export function getColorHex(score: number): string {
  const rgb = getColorRGB(score)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

/**
 * 根据分数获取颜色（CSS rgba格式）
 * @param score 分数 (0-100)
 * @param alpha 透明度 (0-1)
 * @returns CSS rgba字符串
 */
export function getColorRGBA(score: number, alpha: number = 1): string {
  const rgb = getColorRGB(score)
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${alpha})`
}

/**
 * 获取分数对应的等级信息
 * @param score 分数 (0-100)
 * @returns 等级信息对象
 */
export function getGrade(score: number): { range: number[]; label: string; color: string } {
  if (score < 20) return COLOR_GRADES.EXCELLENT     // 0-20: 优秀（最环保）
  if (score < 40) return COLOR_GRADES.GOOD          // 20-40: 良好
  if (score < 60) return COLOR_GRADES.AVERAGE       // 40-60: 中等
  if (score < 80) return COLOR_GRADES.POOR          // 60-80: 较差
  return COLOR_GRADES.VERY_POOR                     // 80-100: 很差（最不环保）
}

/**
 * 批量获取颜色（用于图表）
 * @param scores 分数数组
 * @returns HEX颜色数组
 */
export function getColorsForScores(scores: number[]): string[] {
  return scores.map(score => getColorHex(score))
}

/**
 * 计算多个因子的平均分并获取颜色
 * @param scores 分数数组
 * @returns { average: number, color: string }
 */
export function getAverageColor(scores: number[]): { average: number; color: string } {
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
  return {
    average,
    color: getColorHex(average)
  }
}

/**
 * 生成颜色图例数据（用于图表legend）
 */
export function getColorLegend(): Array<{ range: string; color: string; label: string }> {
  return [
    { range: '0-20', color: COLOR_BREAKPOINTS.COLORS_HEX[0], label: '优秀（最环保）' },
    { range: '20-40', color: COLOR_BREAKPOINTS.COLORS_HEX[1], label: '良好' },
    { range: '40-60', color: COLOR_BREAKPOINTS.COLORS_HEX[2], label: '中等' },
    { range: '60-80', color: COLOR_BREAKPOINTS.COLORS_HEX[4], label: '较差' },
    { range: '80-100', color: COLOR_BREAKPOINTS.COLORS_HEX[5], label: '很差（最不环保）' }
  ]
}
