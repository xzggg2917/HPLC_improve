# Factors 全局试剂库架构说明

## 🎯 设计理念

Factors 表现在是一个**全局共享的试剂因子数据库**，类似于一个中央数据库，所有用户和所有文件共享同一份数据。

## 📋 核心特性

### 1. 全局共享
- **所有方法文件共享同一份试剂库**
- **所有用户共享同一份试剂库**
- 修改试剂数据后，所有文件和用户立即生效

### 2. 独立存储
```
localStorage['hplc_factors_data']  ← 全局试剂库
localStorage['hplc_current_data']  ← 当前方法文件（不包含factors）
```

### 3. 完整的数据操作
- ✅ **增**：在 Factors Page 添加新试剂
- ✅ **删**：删除不需要的试剂
- ✅ **改**：编辑试剂的所有因子数据
- ✅ **查**：查看完整的试剂库

## 🔄 工作流程

### 首次使用
```
1. 打开 Factors Page
2. 系统自动加载 16 个预定义试剂
3. 可以立即使用，也可以自定义修改
```

### 添加新试剂
```
1. 点击 "Add Reagent" 按钮
2. 填写试剂信息和因子数据
3. 保存后立即写入全局库
4. 所有文件的评分计算自动使用新数据
```

### 编辑试剂
```
1. 点击 "Edit" 按钮进入编辑模式
2. 修改任意试剂的因子值
3. 点击 "Save" 保存到全局库
4. 或点击 "Cancel" 取消修改
```

### 删除试剂
```
1. 点击 "Delete" 按钮进入删除模式
2. 点击试剂行的垃圾桶图标删除
3. 立即从全局库删除
4. 所有文件不再使用该试剂
```

### 重置试剂库
```
1. 点击 "Reset" 按钮
2. 恢复到预定义的 16 个试剂
3. 自定义试剂恢复到原始值
```

## 📂 文件存储格式

### 方法文件（.json）
```json
{
  "methods": [...],
  "gradient": {...},
  "factors": [],  ← 空数组，不保存试剂数据
  "lastModified": "2025-12-07T..."
}
```

### 全局试剂库（localStorage）
```json
{
  "hplc_factors_data": [
    {
      "id": "1",
      "name": "Acetone",
      "density": 0.791,
      "releasePotential": 0.698,
      ...
    },
    ...
  ]
}
```

## 🔧 技术实现

### FactorsPage.tsx
```typescript
// 直接从全局存储初始化
const [reagents, setReagents] = useState(() => {
  const stored = localStorage.getItem(STORAGE_KEYS.FACTORS)
  return stored ? JSON.parse(stored) : PREDEFINED_REAGENTS
})

// 所有操作都保存到全局库
const saveToGlobalLibrary = async (updatedReagents) => {
  await StorageHelper.setJSON(STORAGE_KEYS.FACTORS, updatedReagents)
  window.dispatchEvent(new Event('factorsLibraryUpdated'))
}
```

### AppContext.tsx
```typescript
// setAllData: 从全局库读取 factors
const setAllData = async (newData: AppData) => {
  const globalFactors = await StorageHelper.getJSON(STORAGE_KEYS.FACTORS) || []
  
  setData({
    ...newData,
    factors: globalFactors  // 使用全局库，忽略文件中的 factors
  })
}

// exportData: 不保存 factors 到文件
const exportData = async () => {
  return {
    ...data,
    factors: [],  // 空数组，不保存到文件
    ...
  }
}
```

## 🚀 优势

### 1. 数据一致性
- 所有文件使用同一份试剂数据
- 避免不同文件的试剂数据不一致
- 评分计算结果准确可靠

### 2. 易于维护
- 统一管理试剂库
- 修改一次，全局生效
- 不需要逐个文件更新

### 3. 用户体验
- 像操作数据库一样操作试剂库
- 增删改查操作直观
- 新文件自动使用最新试剂库

### 4. 扩展性
- 可以添加"导入试剂库"功能
- 可以添加"导出试剂库"功能
- 可以添加"多个试剂库切换"功能

## ⚠️ 注意事项

### 1. 旧文件兼容性
- 旧文件中的 `factors` 字段会被忽略
- 系统自动使用全局库数据
- 无需手动迁移

### 2. 数据备份
- 试剂库存储在 localStorage
- 建议定期导出备份
- 清除浏览器数据会丢失试剂库

### 3. 删除试剂影响
- 删除试剂后，使用该试剂的方法会缺失数据
- 删除前请确认没有方法使用该试剂
- 可以通过 Reset 恢复预定义试剂

## 🔮 未来扩展

### 可能的功能增强
1. **导入/导出试剂库**
   - 支持从文件导入试剂数据
   - 支持导出当前试剂库

2. **多试剂库管理**
   - 创建多个试剂库
   - 切换不同的试剂库

3. **试剂搜索/筛选**
   - 按名称搜索试剂
   - 按分类筛选试剂

4. **试剂使用统计**
   - 显示哪些方法使用了该试剂
   - 警告删除会影响的方法

5. **云端同步**
   - 支持多设备同步试剂库
   - 团队共享试剂库

## 📝 总结

新的 Factors 全局试剂库架构实现了：
- ✅ 数据集中管理
- ✅ 全局共享使用
- ✅ 操作简单直观
- ✅ 自动同步更新
- ✅ 易于扩展维护

这种设计更符合实际使用场景，让试剂因子数据真正成为一个共享的"知识库"。
