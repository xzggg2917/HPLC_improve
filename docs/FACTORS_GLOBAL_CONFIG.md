# Factors 全局配置说明

## 问题描述

之前的实现中，Factors（试剂危害因子表）数据会随着方法文件一起保存和加载：
- 在文件A中修改Factors → 保存到文件A
- 打开文件B → 文件B的Factors覆盖全局配置
- 结果：在文件A中的修改丢失，每个文件的Factors都不一致

## 解决方案

将 **Factors 表设置为全局通用配置**：

### 1. 数据存储位置
- **全局配置**：`localStorage['hplc_factors_data']`（所有文件共享）
- **方法文件**：不再包含 factors 字段

### 2. 加载行为
打开任何方法文件时：
```typescript
// ✅ 新行为：从 localStorage 读取全局 Factors
const savedFactors = localStorage.getItem('hplc_factors_data')
let factorsToUse = savedFactors ? JSON.parse(savedFactors) : PREDEFINED_REAGENTS

// ❌ 旧行为：使用文件中的 factors
// let factorsToUse = newData.factors
```

### 3. 保存行为
保存方法文件时：
```typescript
// ✅ 新行为：不包含 factors 字段
exportData(): AppData {
  return {
    ...data,
    factors: [], // 空数组，不保存
    gradient: gradientDataToSave,
    ...
  }
}

// ❌ 旧行为：包含当前 factors
// return data
```

### 4. 修改 Factors 的位置
只能在 **Factors Page** 修改：
- 添加/删除试剂
- 修改因子值（P, S, H, E, R, D）
- 修改会立即保存到 `localStorage['hplc_factors_data']`
- 所有打开的文件都会使用最新的 Factors 配置

## 优势

✅ **一致性**：所有方法文件使用相同的 Factors 配置  
✅ **便捷性**：只需修改一次，全局生效  
✅ **准确性**：避免不同文件使用不同的试剂危害评估标准  
✅ **简洁性**：方法文件更小，只包含实验参数

## 技术实现

### 修改文件
1. `frontend/src/contexts/AppContext.tsx`
   - `setAllData()`: 从 localStorage 读取 factors，不使用文件中的 factors
   - `exportData()`: 返回空的 factors 数组，不保存到文件

### 数据流
```
FactorsPage (修改) 
    ↓
localStorage['hplc_factors_data'] (全局存储)
    ↓
所有页面 (共享使用)
```

### 文件格式对比
```json
// ❌ 旧格式（每个文件都包含）
{
  "version": "1.0.0",
  "methods": { ... },
  "factors": [
    { "name": "Water", "P": 5.11, "S": 0, ... },
    { "name": "Methanol", "P": 4.09, "S": 1, ... },
    ...
  ],
  "gradient": [ ... ]
}

// ✅ 新格式（不包含 factors）
{
  "version": "1.0.0",
  "methods": { ... },
  "factors": [],  // 空数组
  "gradient": [ ... ]
}
```

## 兼容性

- ✅ 打开旧文件（包含 factors）：自动忽略文件中的 factors，使用全局配置
- ✅ 首次使用：自动初始化为预定义试剂列表（PREDEFINED_REAGENTS）
- ✅ 跨文件切换：Factors 配置保持不变

## 使用建议

1. **首次设置**：在 Factors Page 配置所有可能用到的试剂
2. **日常使用**：创建方法文件时不用担心 Factors 配置
3. **新增试剂**：在 Factors Page 添加后，所有文件立即可用
4. **修改因子**：在 Factors Page 修改后，所有评分结果会基于新值重新计算

## 更新日期
2025-12-07
