# HPLC 梯度程序计算逻辑说明

## 核心计算原理

### 1. 体积计算
```
总体积 = 总时间 × 流速
```

### 2. 积分计算(梯形法则)
曲线下的面积表示百分比×时间的累积值：
```
积分 = Σ [(y₁ + y₂) / 2] × (t₂ - t₁)
```

### 3. 平均百分比计算
```
Mobile Phase A 平均百分比 = 积分_A / 总时间
Mobile Phase B 平均百分比 = 积分_B / 总时间
```
注意：积分_A + 积分_B 应该等于 100 × 总时间

### 4. 流动相体积计算
```
Mobile Phase A 体积 = 总体积 × (平均百分比_A / 100)
Mobile Phase B 体积 = 总体积 × (平均百分比_B / 100)
```

### 5. 各试剂体积计算

#### 从 Methods 页面获取的数据结构:
```javascript
{
  mobilePhaseA: {
    reagents: [
      { reagentName: "甲醇", percentage: 60, ratio: 0.6 },
      { reagentName: "水", percentage: 40, ratio: 0.4 }
    ]
  },
  mobilePhaseB: {
    reagents: [
      { reagentName: "乙腈", percentage: 100, ratio: 1.0 }
    ]
  }
}
```

#### 试剂体积计算:
```
试剂在 Mobile Phase A 中的体积 = Mobile Phase A 体积 × 试剂比例
试剂在 Mobile Phase B 中的体积 = Mobile Phase B 体积 × 试剂比例
```

### 6. 总试剂体积汇总
```javascript
allReagentVolumes = {
  "甲醇": 体积_A中的甲醇,
  "水": 体积_A中的水,
  "乙腈": 体积_B中的乙腈
}
```

## 实际计算示例

### 输入数据:
```
梯度步骤:
  Step 0: time=0s,   A=10%, flowRate=1.0 ml/min
  Step 1: time=300s, A=90%, flowRate=1.0 ml/min

Methods 数据:
  Mobile Phase A: 甲醇60% + 水40%
  Mobile Phase B: 乙腈100%
```

### 计算过程:

1. **总时间** = 300s = 5min

2. **总体积** = 5min × 1.0ml/min = 5ml

3. **积分计算** (假设线性变化):
   - 积分_A = (10 + 90) / 2 × 300 = 15000 (%·s)
   - 积分_B = (90 + 10) / 2 × 300 = 15000 (%·s)

4. **平均百分比**:
   - 平均百分比_A = 15000 / 300 = 50%
   - 平均百分比_B = 15000 / 300 = 50%

5. **流动相体积**:
   - Mobile Phase A 体积 = 5ml × 0.5 = 2.5ml
   - Mobile Phase B 体积 = 5ml × 0.5 = 2.5ml

6. **试剂体积**:
   - 甲醇 = 2.5ml × 0.6 = 1.5ml
   - 水 = 2.5ml × 0.4 = 1.0ml
   - 乙腈 = 2.5ml × 1.0 = 2.5ml

7. **总试剂用量**:
   ```
   {
     "甲醇": 1.5ml,
     "水": 1.0ml,
     "乙腈": 2.5ml
   }
   ```

## 数据存储结构

### localStorage 中的 `hplc_gradient_data`:
```javascript
{
  steps: [...],           // 梯度步骤
  chartData: [...],       // 图表数据
  calculations: {
    totalVolume: 5.0,
    totalTime: 300,
    averageFlowRate: 1.0,
    sampleCount: 10,      // 来自 Methods
    
    mobilePhaseA: {
      volume: 2.5,
      averagePercentage: 50,
      integral: 15000,
      components: [
        { reagentName: "甲醇", percentage: 60, ratio: 0.6, volume: 1.5 },
        { reagentName: "水", percentage: 40, ratio: 0.4, volume: 1.0 }
      ]
    },
    
    mobilePhaseB: {
      volume: 2.5,
      averagePercentage: 50,
      integral: 15000,
      components: [
        { reagentName: "乙腈", percentage: 100, ratio: 1.0, volume: 2.5 }
      ]
    },
    
    samplePreTreatment: {
      components: [...]    // 来自 Methods
    },
    
    allReagentVolumes: {
      "甲醇": 1.5,
      "水": 1.0,
      "乙腈": 2.5
    }
  },
  
  timestamp: "2025-11-07T..."
}
```

## 用于绿色化学评估的数据

从 `calculations.allReagentVolumes` 可以获取每种试剂的总用量，结合:
- 试剂的绿色化学评分(从 backend/app/services/green_chemistry.py 的 SOLVENT_DATABASE)
- 样品数量(sampleCount)
- 试剂的环境影响、健康危害等参数

可以计算:
1. **总绿色化学评分**
2. **单样品试剂用量**
3. **环境影响评估**
4. **Eco-Scale 分数**
5. **试剂回收建议**

## 注意事项

1. 流速可以是变化的,当前实现使用最后一步的流速作为平均流速(简化处理)
2. 如需更精确,可以为每个区间计算不同的流速
3. 积分使用梯形法则,1000个数据点确保精度
4. 所有体积单位为 ml,时间单位可以是 s 或 min(需统一)
