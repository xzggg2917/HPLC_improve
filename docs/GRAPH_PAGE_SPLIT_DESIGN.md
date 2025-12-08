# Graph 页面拆分设计方案

## 📋 总体架构

根据后端评分体系的三个层级，将原 GraphPage 拆分为三个独立页面：

```
Graph (父级路由)
├── PretreatmentAnalysis (样品前处理可视化)
├── InstrumentAnalysis (样品分析可视化)  
└── MethodEvaluation (方法绿色度评估) - 原 GraphPage
```

---

## 🎯 设计原则

1. **数据来源统一**：所有页面都从 `STORAGE_KEYS.SCORE_RESULTS` 读取后端计算结果
2. **分层展示**：每个页面展示对应层级的评分数据
3. **独立导航**：三个页面可独立访问，互不干扰
4. **共享组件**：复用现有的图表组件（雷达图、扇形图、极坐标图等）

---

## 📊 页面1：样品前处理可视化 (PretreatmentAnalysis)

### 数据来源
```typescript
scoreResults.preparation = {
  masses: { [reagent: string]: number },
  sub_factors: { S1, S2, S3, S4, H1, H2, E1, E2, E3 },
  major_factors: { S, H, E },
  score2: number  // 前处理阶段总分 (0-100)
}
scoreResults.additional_factors = {
  pretreatment_R: number,  // 可回收性 (0-100)
  pretreatment_D: number   // 可降解性 (0-100)
}
```

### 可视化内容

#### 1. 总分卡片 (Score₂)
```tsx
<Card title="样品前处理绿色度评分 (Score₂)">
  <Title level={1}>{score2.toFixed(2)} / 100</Title>
</Card>
```

#### 2. 阶段分析阶段分 (5 个大因子)
```tsx
<Row>
  <Col>安全 (S): {prepMajor.S} / 100</Col>
  <Col>健康 (H): {prepMajor.H} / 100</Col>
  <Col>环境 (E): {prepMajor.E} / 100</Col>
</Row>
<Row>
  <Col>可回收 (R): {pretreatment_R} / 100</Col>
  <Col>可降解 (D): {pretreatment_D} / 100</Col>
</Row>
```

#### 3. 小因子雷达图（9个小因子）
- 与现有雷达图相同，但只展示 `preparation.sub_factors`
- S1, S2, S3, S4, H1, H2, E1, E2, E3

#### 4. 大因子扇形图（5个大因子）
- S, H, E, R, D（无P因子）
- 复用 `<FanChart>` 组件

#### 5. 试剂质量分布饼图
```tsx
<NestedPieChart 
  data={preparation.masses}
  title="前处理试剂质量分布"
/>
```

#### 6. 样品数量显示
```tsx
<Alert type="info">
  样品数量: {sampleCount}
  总试剂质量: {totalMass.toFixed(2)} g
</Alert>
```

---

## 📊 页面2：样品分析可视化 (InstrumentAnalysis)

### 数据来源
```typescript
scoreResults.instrument = {
  masses: { [reagent: string]: number },
  sub_factors: { S1, S2, S3, S4, H1, H2, E1, E2, E3 },
  major_factors: { S, H, E },
  score1: number  // 仪器分析阶段总分 (0-100)
}
scoreResults.additional_factors = {
  P: number,           // 能耗因子 (0-100)
  instrument_R: number, // 可回收性 (0-100)
  instrument_D: number  // 可降解性 (0-100)
}
```

### 可视化内容

#### 1. 总分卡片 (Score₁)
```tsx
<Card title="样品分析绿色度评分 (Score₁)">
  <Title level={1}>{score1.toFixed(2)} / 100</Title>
</Card>
```

#### 2. 仪器分析阶段分 (6 个大因子)
```tsx
<Row>
  <Col>安全 (S): {instMajor.S} / 100</Col>
  <Col>健康 (H): {instMajor.H} / 100</Col>
  <Col>环境 (E): {instMajor.E} / 100</Col>
</Row>
<Row>
  <Col>可回收 (R): {instrument_R} / 100</Col>
  <Col>可降解 (D): {instrument_D} / 100</Col>
  <Col>能耗 (P): {P} / 100</Col>
</Row>
```

#### 3. 小因子雷达图（9个小因子）
- 与现有雷达图相同，但只展示 `instrument.sub_factors`
- S1, S2, S3, S4, H1, H2, E1, E2, E3

#### 4. 大因子扇形图（6个大因子）
- S, H, E, R, D, P（包含P因子）
- 复用 `<FanChart>` 组件

#### 5. 试剂质量分布饼图
```tsx
<NestedPieChart 
  data={instrument.masses}
  title="流动相试剂质量分布"
/>
```

#### 6. 梯度信息显示
```tsx
<Alert type="info">
  运行时间: {totalTime.toFixed(2)} min
  流速: {flowRate.toFixed(2)} mL/min
  总体积: {totalVolume.toFixed(2)} mL
</Alert>
```

---

## 📊 页面3：方法绿色度评估 (MethodEvaluation)

### 数据来源
```typescript
scoreResults.merged = {
  sub_factors: { S1, S2, S3, S4, H1, H2, E1, E2, E3 }  // 合并后的小因子
}
scoreResults.final = {
  score3: number  // 最终总分 (0-100)
}
// 大因子取仪器和前处理的平均值
avgMajorFactors = {
  S: (inst.S + prep.S) / 2,
  H: (inst.H + prep.H) / 2,
  E: (inst.E + prep.E) / 2,
  R: (inst_R + prep_R) / 2,
  D: (inst_D + prep_D) / 2,
  P: P  // 仅仪器分析有P
}
```

### 可视化内容（保持现有 GraphPage 的所有内容）

#### 1. 最终总分卡片 (Score₃)
```tsx
<Card title="最终绿色化学评分 (Score₃)">
  <Title level={1}>{score3.toFixed(2)} / 100</Title>
</Card>
```

#### 2. 阶段评分对比
```tsx
<Row>
  <Col>
    <Card title="仪器分析阶段 (Score₁)">
      {score1.toFixed(2)} / 100
    </Card>
  </Col>
  <Col>
    <Card title="样品前处理阶段 (Score₂)">
      {score2.toFixed(2)} / 100
    </Card>
  </Col>
</Row>
```

#### 3. 小因子雷达图（9个小因子）
- 展示 `merged.sub_factors`（合并后的数据）
- 当前 GraphPage 的雷达图

#### 4. 大因子扇形图（6个大因子）
- S, H, E, R, D, P（平均值）
- 当前 GraphPage 的扇形图

#### 5. 附加因子极坐标图 (P/R/D)
- 当前 GraphPage 的极坐标图

#### 6. 综合嵌套饼图
```tsx
<NestedPieChart 
  data={{
    instrument: instrument.masses,
    preparation: preparation.masses
  }}
  title="全流程试剂质量分布"
/>
```

---

## 🗂️ 文件结构

```
frontend/src/pages/
├── GraphPage.tsx (保留，作为路由容器)
├── PretreatmentAnalysisPage.tsx (新增)
├── InstrumentAnalysisPage.tsx (新增)
└── MethodEvaluationPage.tsx (新增，基于原 GraphPage)

frontend/src/components/
├── FanChart.tsx (共享)
├── PolarBarChart.tsx (共享)
├── NestedPieChart.tsx (共享)
└── RadarChart.tsx (可选，如果需要自定义)
```

---

## 🚀 实施步骤

### Step 1: 创建三个新页面组件
1. `PretreatmentAnalysisPage.tsx`
2. `InstrumentAnalysisPage.tsx`  
3. `MethodEvaluationPage.tsx`（复制现有 GraphPage.tsx）

### Step 2: 修改路由配置
```tsx
// App.tsx
<Route path="/graph" element={<Navigate to="/graph/method-evaluation" replace />} />
<Route path="/graph">
  <Route path="pretreatment" element={<PretreatmentAnalysisPage />} />
  <Route path="instrument" element={<InstrumentAnalysisPage />} />
  <Route path="method-evaluation" element={<MethodEvaluationPage />} />
</Route>
```

### Step 3: 添加导航菜单
在三个页面顶部添加 Tab 切换：
```tsx
<Tabs activeKey={currentTab}>
  <TabPane tab="样品前处理" key="pretreatment" />
  <TabPane tab="样品分析" key="instrument" />
  <TabPane tab="方法绿色度评估" key="method-evaluation" />
</Tabs>
```

### Step 4: 数据读取和状态管理
每个页面独立读取 `SCORE_RESULTS`，但只展示对应的数据层级。

---

## 📐 数据流关系图

```
后端 calculate_full_scores()
         ↓
STORAGE_KEYS.SCORE_RESULTS
         ↓
    ┌────┴────┬────────────┬──────────────┐
    ↓         ↓            ↓              ↓
preparation instrument  merged         final
    ↓         ↓            ↓              ↓
前处理页面  分析页面    ← 合并 →     评估页面
(Score₂)   (Score₁)                   (Score₃)
```

---

## 🎨 UI/UX 建议

1. **颜色编码**
   - 前处理：蓝色系 (#1890ff)
   - 仪器分析：绿色系 (#52c41a)
   - 方法评估：紫色系 (#722ed1)

2. **页面布局**
   - 顶部：导航 Tab + 总分卡片
   - 中部：大因子可视化（扇形图/条形图）
   - 下部：小因子雷达图 + 详细数据表

3. **交互设计**
   - 点击图表元素显示详细数据
   - 提供"导出报告"功能
   - 支持打印和截图

---

## ⚠️ 注意事项

1. **数据完整性检查**
   - 确保 `scoreResults` 存在再渲染
   - 处理数据缺失的情况

2. **向后兼容**
   - 保留旧的 GraphPage 作为重定向
   - 支持旧链接自动跳转

3. **性能优化**
   - 三个页面使用相同的数据源，避免重复读取
   - 考虑使用 Context 共享 `scoreResults`

---

## 🔄 后续扩展

1. **对比功能**
   - 在评估页面对比两个阶段的差异
   - 高亮显示薄弱环节

2. **趋势分析**
   - 记录历史评分
   - 展示评分变化趋势图

3. **导出功能**
   - PDF 报告生成
   - Excel 数据导出

---

## 📝 总结

| 页面 | 数据来源 | 总分 | 大因子数 | 特色 |
|------|---------|------|---------|------|
| 样品前处理 | preparation | Score₂ | 5 (S,H,E,R,D) | 样品数量、试剂消耗 |
| 样品分析 | instrument | Score₁ | 6 (S,H,E,R,D,P) | 流速、运行时间、能耗 |
| 方法绿色度评估 | merged + final | Score₃ | 6 (平均值) | 综合对比、整体评价 |

这个设计既保持了原有功能，又清晰地展示了评分体系的三个层级，方便用户理解和分析！
