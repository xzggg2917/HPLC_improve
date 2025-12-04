# HPLC 项目开发规范 - 数据存储

## 🚨 重要原则

**禁止直接使用 `localStorage` API！**

本项目是桌面应用，需要将数据持久化到文件系统。所有数据存储必须使用统一的 `StorageHelper` 接口。

## ✅ 标准用法

### 1. 导入接口
```typescript
import { StorageHelper, STORAGE_KEYS } from '../utils/storage'
```

### 2. 读取数据
```typescript
// 带类型安全
const data = await StorageHelper.getJSON<ReagentFactor[]>(STORAGE_KEYS.FACTORS)

// 简单读取
const value = await StorageHelper.getJSON(STORAGE_KEYS.MY_KEY)

// 处理不存在的情况
const data = await StorageHelper.getJSON(STORAGE_KEYS.MY_KEY) || defaultValue
```

### 3. 保存数据
```typescript
// 保存对象/数组
await StorageHelper.setJSON(STORAGE_KEYS.FACTORS, factorsData)

// 保存简单值
await StorageHelper.setJSON(STORAGE_KEYS.POWER_SCORE, 123.456)
```

### 4. 在组件中使用
```typescript
const MyComponent: React.FC = () => {
  const [data, setData] = useState<MyType[]>([])

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      const stored = await StorageHelper.getJSON<MyType[]>(STORAGE_KEYS.MY_KEY)
      if (stored) {
        setData(stored)
      }
    }
    loadData()
  }, [])

  // 保存数据
  const saveData = async () => {
    await StorageHelper.setJSON(STORAGE_KEYS.MY_KEY, data)
    message.success('数据已保存')
  }

  return (
    <Button onClick={saveData}>保存</Button>
  )
}
```

### 5. 添加新的存储键
```typescript
// 在 frontend/src/utils/storage.ts 中添加
export const STORAGE_KEYS = {
  // ...existing keys...
  MY_NEW_KEY: 'hplc_my_new_data',  // 命名规范：hplc_开头
} as const
```

## ❌ 错误示例

### 错误 1：直接使用 localStorage
```typescript
// ❌ 错误
localStorage.setItem('my_data', JSON.stringify(data))
const data = JSON.parse(localStorage.getItem('my_data'))

// ✅ 正确
await StorageHelper.setJSON(STORAGE_KEYS.MY_DATA, data)
const data = await StorageHelper.getJSON(STORAGE_KEYS.MY_DATA)
```

### 错误 2：忘记 await
```typescript
// ❌ 错误
const data = StorageHelper.getJSON(STORAGE_KEYS.MY_KEY)
console.log(data)  // 输出：Promise { <pending> }

// ✅ 正确
const data = await StorageHelper.getJSON(STORAGE_KEYS.MY_KEY)
console.log(data)  // 输出：实际数据
```

### 错误 3：在非 async 函数中使用
```typescript
// ❌ 错误
const loadData = () => {
  const data = await StorageHelper.getJSON(STORAGE_KEYS.MY_KEY)  // 语法错误
  setData(data)
}

// ✅ 正确
const loadData = async () => {
  const data = await StorageHelper.getJSON(STORAGE_KEYS.MY_KEY)
  setData(data)
}
```

### 错误 4：不使用常量
```typescript
// ❌ 错误 - 魔法字符串
await StorageHelper.setJSON('factors', data)
await StorageHelper.setJSON('hplc_factors_data', data)

// ✅ 正确 - 使用常量
await StorageHelper.setJSON(STORAGE_KEYS.FACTORS, data)
```

## 🔍 为什么不能用 localStorage

### 问题 1：数据不持久
- localStorage 存储在浏览器缓存中
- 用户清理缓存 → 数据丢失
- 软件更新 → 可能清空数据

### 问题 2：不符合桌面软件标准
- 桌面软件应该将数据保存到用户文档目录
- localStorage 不适合长期存储重要数据
- 无法进行数据备份和迁移

### 问题 3：Electron 环境问题
- Electron 的 localStorage 位置不稳定
- 不同版本可能改变存储位置
- 可能因为权限问题无法访问

## 📦 数据存储位置

### 开发环境（浏览器）
- 使用 localStorage（临时）
- 位置：浏览器开发者工具 → Application → Local Storage

### 生产环境（Electron 桌面版）
- 使用文件系统（持久化）
- Windows: `C:\Users\<username>\AppData\Roaming\HPLC_improve\`
- macOS: `~/Library/Application Support/HPLC_improve/`
- Linux: `~/.config/HPLC_improve/`

### 文件结构
```
HPLC_improve/
├── users.json              # 用户账户数据
└── app_data.json           # 应用数据
    ├── hplc_factors_data       # Factors 数据
    ├── hplc_methods_raw        # Methods 数据
    ├── hplc_gradient_data      # Gradient 数据
    ├── hplc_score_results      # 评分结果
    └── ...
```

## 🎯 最佳实践

### 1. 统一管理存储键
所有存储键都在 `STORAGE_KEYS` 中定义，便于：
- 避免拼写错误
- 便于重构和搜索
- 类型检查

### 2. 类型安全
```typescript
// 使用泛型确保类型安全
interface MyData {
  id: string
  value: number
}

const data = await StorageHelper.getJSON<MyData[]>(STORAGE_KEYS.MY_KEY)
// TypeScript 知道 data 是 MyData[] 类型
```

### 3. 错误处理
```typescript
try {
  const data = await StorageHelper.getJSON(STORAGE_KEYS.MY_KEY)
  if (data) {
    // 使用数据
  } else {
    // 数据不存在，使用默认值
  }
} catch (error) {
  console.error('读取数据失败:', error)
  message.error('加载数据失败')
}
```

### 4. 性能优化
```typescript
// ❌ 不好 - 每次都读取
const handleChange = async (value: string) => {
  const data = await StorageHelper.getJSON(STORAGE_KEYS.MY_KEY)
  // ...处理
  await StorageHelper.setJSON(STORAGE_KEYS.MY_KEY, newData)
}

// ✅ 好 - 使用状态管理
const [data, setData] = useState([])

useEffect(() => {
  const loadData = async () => {
    const stored = await StorageHelper.getJSON(STORAGE_KEYS.MY_KEY)
    setData(stored || [])
  }
  loadData()
}, [])

const handleChange = (value: string) => {
  const newData = [...data, value]
  setData(newData)
  // 防抖保存
  debouncedSave(newData)
}
```

## 🧪 测试

### 开发环境测试
1. 修改数据并保存
2. 刷新页面
3. 数据应该保留

### 生产环境测试
1. 构建 Electron 应用
2. 安装并运行
3. 添加数据并保存
4. 完全关闭应用
5. 重新打开
6. 验证数据是否保留

### 数据位置验证
```typescript
// 在代码中查看存储位置
const info = await StorageHelper.getStorageInfo()
console.log('数据存储位置:', info)
```

## 📚 相关文件

- `frontend/src/utils/storage.ts` - 存储接口实现
- `electron/main.js` - Electron 文件系统 IPC
- `docs/STORAGE_MIGRATION_GUIDE.md` - 迁移指南
- `docs/STORAGE_FIX_SUMMARY.md` - 修复总结

## 🚦 代码审查检查项

提交代码前检查：
- [ ] 没有使用 `localStorage.getItem`
- [ ] 没有使用 `localStorage.setItem`
- [ ] 使用了 `STORAGE_KEYS` 常量
- [ ] 异步函数正确使用 `async/await`
- [ ] 添加了适当的错误处理
- [ ] 类型定义正确

---

**记住：永远使用 StorageHelper，不要直接使用 localStorage！**

**最后更新**: 2025-12-03
