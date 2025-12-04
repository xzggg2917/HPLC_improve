# 存储系统迁移指南

## 问题背景

当前代码中存在**混合使用存储接口**的问题：
- ✅ 已有统一的 `storage.ts` 接口（支持 Electron 文件系统和浏览器 localStorage）
- ❌ 但部分代码仍直接调用 `localStorage` API

**影响：**
- 桌面版（Electron）运行时，直接使用 `localStorage` 的数据**不会持久化到文件系统**
- 用户关闭应用后，这些数据可能丢失
- 数据分散存储，不利于备份和迁移

## 已修复的文件

### ✅ FactorsPage.tsx
已完全迁移到 `StorageHelper`：
- `checkAndUpdateFactorsData()` - 版本检查
- `useLayoutEffect()` - 数据初始化和同步
- `useEffect()` - 自动保存

**关键改动：**
```typescript
// ❌ 旧代码
const storedVersion = localStorage.getItem('hplc_factors_version')
localStorage.setItem('hplc_factors_data', JSON.stringify(data))

// ✅ 新代码
const storedVersion = await StorageHelper.getJSON<string>(STORAGE_KEYS.FACTORS_VERSION)
await StorageHelper.setJSON(STORAGE_KEYS.FACTORS, data)
```

## 待修复的文件

### ⏳ MethodsPage.tsx
**问题代码位置：**
1. Line 72: `localStorage.getItem('hplc_factors_data')`
2. Line 108: `localStorage.getItem('hplc_score_results')`
3. Line 127: `localStorage.getItem('hplc_gradient_data')`
4. Line 243: `localStorage.setItem('hplc_methods_raw', ...)`
5. Line 418: `localStorage.setItem('hplc_gradient_data', ...)`
6. Line 988: `localStorage.setItem('hplc_score_results', ...)`
7. 其他多处...

**修复方案：**
```typescript
// 导入工具
import { StorageHelper, STORAGE_KEYS } from '../utils/storage'

// 读取数据
const factors = await StorageHelper.getJSON<ReagentFactor[]>(STORAGE_KEYS.FACTORS)
const gradient = await StorageHelper.getJSON(STORAGE_KEYS.GRADIENT)
const methods = await StorageHelper.getJSON(STORAGE_KEYS.METHODS)

// 写入数据
await StorageHelper.setJSON(STORAGE_KEYS.FACTORS, factorsData)
await StorageHelper.setJSON(STORAGE_KEYS.GRADIENT, gradientData)
await StorageHelper.setJSON(STORAGE_KEYS.METHODS, methodsData)
```

### ⏳ TablePage.tsx
**问题代码位置：**
1. Line 71-73: 读取 factors/gradient/methods 数据
2. Line 199: `localStorage.getItem('hplc_power_score')`
3. Line 425: 两处读取 power_score

**修复方案：**
```typescript
// 组件改为 async
const TablePage: React.FC = () => {
  // 在 useEffect 中异步加载
  useEffect(() => {
    const loadData = async () => {
      const factors = await StorageHelper.getJSON(STORAGE_KEYS.FACTORS)
      const gradient = await StorageHelper.getJSON(STORAGE_KEYS.GRADIENT)
      const methods = await StorageHelper.getJSON(STORAGE_KEYS.METHODS)
      const powerScore = await StorageHelper.getJSON('hplc_power_score')
      // 处理数据...
    }
    loadData()
  }, [])
}
```

## 存储键名规范

### 已定义的常量（STORAGE_KEYS）
```typescript
export const STORAGE_KEYS = {
  USERS: 'hplc_users',
  CURRENT_USER: 'hplc_current_user',
  METHODS: 'hplc_methods_raw',
  FACTORS: 'hplc_factors_data',
  GRADIENT: 'hplc_gradient_data',
  COMPARISON: 'hplc_comparison_files',
  FACTORS_VERSION: 'hplc_factors_version',
} as const
```

### 需要添加的常量
```typescript
// 建议在 storage.ts 中添加：
export const STORAGE_KEYS = {
  // ...existing keys...
  SCORE_RESULTS: 'hplc_score_results',      // 评分结果
  POWER_SCORE: 'hplc_power_score',          // P因子分数
} as const
```

## 迁移检查清单

- [x] FactorsPage.tsx - 完成 ✅
- [ ] MethodsPage.tsx - **优先级最高** ⚠️
- [ ] TablePage.tsx - 优先级高 ⚠️
- [ ] ComparisonPage.tsx - 检查中
- [ ] GraphPage.tsx - 检查中
- [ ] HPLCGradientPage.tsx - 检查中

## Electron 存储架构

### 文件位置
```
Windows: C:\Users\<username>\AppData\Roaming\HPLC_improve\
  ├── users.json          # 用户数据
  └── app_data.json       # 应用数据（包含所有 STORAGE_KEYS）
```

### 数据结构
```json
// app_data.json
{
  "hplc_factors_data": [...],
  "hplc_methods_raw": {...},
  "hplc_gradient_data": {...},
  "hplc_factors_version": "5",
  "hplc_score_results": {...},
  "hplc_power_score": 0.123
}
```

### 优势
- ✅ 持久化存储，不受浏览器缓存影响
- ✅ 跨会话保存
- ✅ 支持导出备份
- ✅ 用户数据独立管理

## 开发注意事项

### 1. 异步操作
所有 `StorageHelper` 方法都是异步的：
```typescript
// ❌ 错误
const data = StorageHelper.getJSON(key)

// ✅ 正确
const data = await StorageHelper.getJSON(key)
```

### 2. 函数改造
需要将使用存储的函数改为 `async`：
```typescript
// ❌ 旧代码
const loadData = () => {
  const data = localStorage.getItem('key')
  // ...
}

// ✅ 新代码
const loadData = async () => {
  const data = await StorageHelper.getJSON('key')
  // ...
}
```

### 3. useEffect 中的异步
```typescript
useEffect(() => {
  const fetchData = async () => {
    const data = await StorageHelper.getJSON(key)
    setState(data)
  }
  fetchData()
}, [])
```

### 4. 类型安全
使用泛型确保类型安全：
```typescript
const factors = await StorageHelper.getJSON<ReagentFactor[]>(STORAGE_KEYS.FACTORS)
const version = await StorageHelper.getJSON<string>(STORAGE_KEYS.FACTORS_VERSION)
```

## 测试验证

### Electron 环境测试
1. 启动应用：`npm run electron:dev`
2. 添加数据并保存
3. 完全关闭应用
4. 重新打开应用
5. 验证数据是否保留

### 存储位置检查
```typescript
const path = await StorageHelper.getStorageInfo()
console.log('存储位置:', path)
// Windows: File System Storage:
// C:\Users\<username>\AppData\Roaming\HPLC_improve
// Files: users.json, app_data.json
```

## 回滚方案

如果迁移后出现问题，可以临时回退：
```typescript
// storage.ts 中添加兼容模式
const COMPATIBILITY_MODE = false

if (COMPATIBILITY_MODE) {
  // 同时写入 localStorage 和文件系统
  localStorage.setItem(key, value)
  await electronAPI.fs.writeAppData(key, value)
}
```

## 未来改进

1. **数据迁移工具**：自动将旧 localStorage 数据迁移到新系统
2. **数据验证**：启动时检查数据完整性
3. **自动备份**：定期自动备份到用户指定位置
4. **数据同步**：支持多设备数据同步（可选）

## 相关文档

- `frontend/src/utils/storage.ts` - 统一存储接口实现
- `electron/main.js` - Electron IPC 处理
- `electron/preload.js` - 桥接脚本

## 负责人

- 存储架构：已实现 ✅
- 代码迁移：进行中 ⏳ (FactorsPage 已完成)
- 测试验证：待进行 ⏳

---

**最后更新**：2025年12月3日
**状态**：进行中 - FactorsPage 已完成，MethodsPage 和 TablePage 待修复
