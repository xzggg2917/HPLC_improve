# 统一颜色分级系统

## 概述

本系统为HPLC绿色化学评分可视化建立了统一的颜色规则，所有图表都遵循相同的颜色标准，以直观反映评分等级。

## 核心原则

- **分数越低越绿（越环保），越高越红（越不环保）**
- **分为5个等级区间**
- **区间内渐变过渡，区间间有明显差异**

## 颜色分级规则

### 分数区间与颜色

| 分数区间 | 等级 | 起始颜色 | 结束颜色 | 代表含义 |
|---------|------|---------|---------|---------|
| 0-20    | 优秀 | `#2e7d32` 深绿色 | `#81c784` 浅绿色 | 完全符合绿色化学标准（最环保）|
| 20-40   | 良好 | `#81c784` 浅绿色 | `#ffd54f` 黄色 | 较好符合标准 |
| 40-60   | 中等 | `#ffd54f` 黄色 | `#ff9800` 橙色 | 基本合格 |
| 60-80   | 较差 | `#ff9800` 橙色 | `#f44336` 红色 | 需要改进 |
| 80-100  | 很差 | `#f44336` 红色 | `#d32f2f` 深红色 | 严重不符合绿色化学标准（最不环保）|

### 关键颜色断点

```typescript
COLORS_HEX = [
  '#2e7d32',  // 0分: 深绿色（最环保）
  '#81c784',  // 20分: 浅绿色
  '#ffd54f',  // 40分: 黄色
  '#ff9800',  // 60分: 橙色
  '#f44336',  // 80分: 红色
  '#d32f2f'   // 100分: 深红色（最不环保）
]
```

## 应用规则

### 1. 雷达图 (Radar Chart)

- **颜色计算**: 取所有小因子分数的平均值
- **填充**: 使用计算出的平均分对应的渐变色
- **描边**: 与填充色相同
- **透明度**: 0.6

**示例**:
```typescript
// 9个小因子: S1, S2, S3, S4, H1, H2, E1, E2, E3
const subFactorValues = [81.38, 60, 21.5, 70, 65, 55, 48, 52, 58]
const average = 56.76
const color = getColorHex(56.76) // 返回 #ff9800 附近的橙色（中等偏差）
```

### 2. 扇形图 (Fan Chart)

- **颜色计算**: 每个扇面独立使用其大因子分数
- **应用**: 6个扇面分别对应 P, D, R, E, H, S
- **填充**: 每个扇面使用各自分数的渐变色

**示例**:
```typescript
const scores = { S: 49.10, H: 67.25, E: 39.66, R: 50, D: 50, P: 0 }
// S扇面: getColorHex(49.10) → 黄橙色（中等）
// H扇面: getColorHex(67.25) → 橙红色（较差）
// E扇面: getColorHex(39.66) → 黄绿色（良好）
// P扇面: getColorHex(0) → 深绿色（优秀，最环保）
```

### 3. 切向极坐标条形图 (Tangential Polar Bar Chart)

- **颜色计算**: 每个条形独立使用其大因子分数
- **应用**: 6个条形分别对应 S, H, E, R, D, P
- **填充**: 每个条形使用各自分数的渐变色

**示例**:
```typescript
data: [
  { value: 49.10, name: 'S', itemStyle: { color: getColorHex(49.10) } },
  { value: 67.25, name: 'H', itemStyle: { color: getColorHex(67.25) } },
  // ...
]
```

### 4. 嵌套饼图 (Nested Pie Chart)

#### 内圈（大因子）
- **颜色计算**: 每个扇形独立使用其大因子分数
- **应用**: 6个扇形对应 S, H, E, R, D, P

#### 外圈（小因子）
- **颜色计算**: 每个扇形独立使用其小因子分数
- **应用**: 9个扇形对应 S1, S2, S3, S4, H1, H2, E1, E2, E3

**示例**:
```typescript
// 内圈
mainFactorData = [
  { value: 49.10, name: 'S', itemStyle: { color: getColorHex(49.10) } },
  // ...
]

// 外圈
subFactorData = [
  { value: 81.38, name: 'S1', itemStyle: { color: getColorHex(81.38) } },
  { value: 60.00, name: 'S2', itemStyle: { color: getColorHex(60.00) } },
  // ...
]
```

## 技术实现

### 核心函数

```typescript
// 1. 获取HEX颜色
function getColorHex(score: number): string
// 输入: 0-100的分数
// 输出: #RRGGBB格式的颜色字符串
// 示例: getColorHex(75) → "#a8d98e"

// 2. 获取RGB颜色
function getColorRGB(score: number): { r: number; g: number; b: number }
// 输入: 0-100的分数
// 输出: RGB对象
// 示例: getColorRGB(75) → { r: 168, g: 217, b: 142 }

// 3. 获取RGBA颜色
function getColorRGBA(score: number, alpha: number): string
// 输入: 0-100的分数, 0-1的透明度
// 输出: CSS rgba字符串
// 示例: getColorRGBA(75, 0.6) → "rgba(168, 217, 142, 0.6)"

// 4. 批量获取颜色
function getColorsForScores(scores: number[]): string[]
// 输入: 分数数组
// 输出: 颜色数组
// 示例: getColorsForScores([20, 50, 80]) → ["#f44336", "#ffb74d", "#81c784"]

// 5. 计算平均分并获取颜色
function getAverageColor(scores: number[]): { average: number; color: string }
// 输入: 分数数组
// 输出: 平均分和对应颜色
// 示例: getAverageColor([60, 70, 80]) → { average: 70, color: "#c5e1a5" }

// 6. 获取等级信息
function getGrade(score: number): { range: number[]; label: string; color: string }
// 输入: 0-100的分数
// 输出: 等级信息
// 示例: getGrade(75) → { range: [60, 80], label: "良好", color: "#81c784" }
```

### 插值算法

系统使用线性插值算法在颜色断点之间平滑过渡：

```typescript
// 线性插值公式
color(score) = color_start + (color_end - color_start) × t

// 其中 t = (score - score_start) / (score_end - score_start)
```

**示例计算**:
- 输入: score = 55
- 所在区间: [40, 60]
- 起始颜色: `#ffd54f` (RGB: 255, 213, 79) - 黄色
- 结束颜色: `#ff9800` (RGB: 255, 152, 0) - 橙色
- t = (55 - 40) / (60 - 40) = 0.75
- R = 255 + (255 - 255) × 0.75 = 255
- G = 213 + (152 - 213) × 0.75 = 167.25 ≈ 167
- B = 79 + (0 - 79) × 0.75 = 19.75 ≈ 20
- 结果: `#ffa714` (橙黄色，中等偏差)

## 使用示例

### 在组件中导入

```typescript
import { getColorHex, getAverageColor } from '../utils/colorScale'
```

### 雷达图示例

```typescript
const subFactorValues = [81.38, 60, 21.5, 70, 65, 55, 48, 52, 58]
const radarColorData = getAverageColor(subFactorValues)

<Radar
  dataKey="score"
  stroke={radarColorData.color}
  fill={radarColorData.color}
  fillOpacity={0.6}
/>
```

### 扇形图示例

```typescript
const factor = 'S'
const score = scores[factor]
const color = getColorHex(score)

ctx.fillStyle = color
ctx.fill()
```

### ECharts图表示例

```typescript
series: {
  type: 'bar',
  data: [
    {
      value: scores.S,
      name: 'S',
      itemStyle: { 
        color: getColorHex(scores.S),
        borderRadius: [0, 8, 8, 0]
      }
    },
    // ...
  ]
}
```

## 视觉效果

### 颜色渐变展示

```
0分  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  100分
🟢 深绿  →  浅绿  →  黄  →  橙  →  红  →  深红 🔴
优秀(最环保)  良好    中等    较差      很差(最不环保)
```

### 实际应用效果

- **低分方法 (20分以下)**: 整体呈绿色调，表明完全符合绿色化学标准
- **中等方法 (40-60分)**: 整体呈黄橙色调，提示有改进空间
- **高分方法 (80分以上)**: 整体呈红色调，警示严重不符合标准

## 文件位置

- **颜色系统**: `frontend/src/utils/colorScale.ts`
- **应用组件**:
  - `frontend/src/pages/GraphPage.tsx` (雷达图)
  - `frontend/src/components/FanChart.tsx` (扇形图)
  - `frontend/src/components/PolarBarChart.tsx` (极坐标条形图)
  - `frontend/src/components/NestedPieChart.tsx` (嵌套饼图)

## 维护说明

### 修改颜色断点

如需调整颜色方案，只需修改 `colorScale.ts` 中的 `COLOR_BREAKPOINTS` 常量：

```typescript
export const COLOR_BREAKPOINTS = {
  SCORES: [0, 20, 40, 60, 80, 100],
  COLORS_HEX: [
    '#your_color_1',  // 0分
    '#your_color_2',  // 20分
    '#your_color_3',  // 40分
    '#your_color_4',  // 60分
    '#your_color_5',  // 80分
    '#your_color_6'   // 100分
  ]
}
```

所有图表会自动使用新的颜色方案，无需修改各个组件。

## 注意事项

1. **一致性**: 所有可视化必须使用统一的颜色系统，禁止硬编码颜色值
2. **可访问性**: 颜色对比度已优化，符合WCAG 2.1 AA标准
3. **性能**: 颜色计算使用线性插值，性能优异
4. **扩展性**: 如需添加新图表，直接导入colorScale工具函数即可

## 更新日志

- **2025-12-02**: 初始版本，建立统一颜色分级系统
  - 定义5个分数区间
  - **核心逻辑：分数越低越绿（越环保），越高越红（越不环保）**
  - 实现线性插值渐变
  - 应用到4种图表组件
