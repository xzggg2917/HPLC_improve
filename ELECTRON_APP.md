# Electron 桌面应用说明

## ⚠️ 重要声明

**本应用是纯 Electron 桌面应用程序，必须通过桌面端运行，不支持浏览器直接访问。**

## 为什么必须使用 Electron？

### 1. 数据持久化
- 使用 Electron 的文件系统 API 进行数据存储
- 数据保存在操作系统的应用数据目录
- **不使用** `localStorage` 或 `sessionStorage`

### 2. 文件加密
- 方法文件使用密码加密存储
- 需要 Node.js 的 `crypto` 模块
- 浏览器环境无法实现相同的加密机制

### 3. 本地文件访问
- 支持导入/导出加密文件
- 支持选择保存位置
- 需要 Electron 的 `dialog` API

### 4. 原生集成
- 跨平台桌面应用体验
- 窗口管理和系统托盘
- 自动更新功能

## 存储架构

```
用户操作
   ↓
React 组件 (frontend/src)
   ↓
StorageHelper (utils/storage.ts)
   ↓
Electron IPC (preload.js)
   ↓
Main Process (electron/main.js)
   ↓
文件系统 (fs.writeFileSync)
   ↓
app_data.json / users.json / data/*.json
```

### 关键存储 Keys

```typescript
STORAGE_KEYS = {
  METHODS: 'hplc_methods_raw',        // 方法数据
  FACTORS: 'hplc_factors_data',       // 因子库
  GRADIENT: 'hplc_gradient_data',     // 梯度数据
  COMPARISON: 'hplc_comparison_files', // 对比文件
  SCORE_RESULTS: 'hplc_score_results', // 评分结果
  CURRENT_USER: 'hplc_current_user',   // 当前用户
  USERS: 'hplc_users'                  // 用户列表（users.json）
}
```

## 运行方式

### ✅ 正确的运行方式

```bash
# 开发模式
npm run dev

# 构建桌面应用
npm run build:electron

# 运行打包后的应用
npm run start:electron
```

### ❌ 错误的运行方式

```bash
# ❌ 不要这样做！浏览器模式不支持
cd frontend
npm run dev
# Electron 窗口会自动打开（不需要浏览器）
```

**错误原因**：
- 缺少 `window.electronAPI`
- 文件系统 IPC 调用失败
- 加密/解密功能不可用
- 存储操作全部失败

## 技术栈对比

| 功能 | 浏览器模式 | Electron 模式 |
|------|-----------|---------------|
| UI 渲染 | ✅ React | ✅ React |
| 数据存储 | ❌ localStorage（不支持）| ✅ File System |
| 文件加密 | ❌ 不可用 | ✅ crypto 模块 |
| 文件选择 | ❌ 受限 | ✅ dialog API |
| 跨平台 | ✅ 浏览器 | ✅ Win/Mac/Linux |
| 数据安全 | ⚠️ 低 | ✅ 高 |

## 开发注意事项

### 1. 永远不要使用 localStorage

```typescript
// ❌ 错误做法
localStorage.setItem('data', JSON.stringify(data))

// ✅ 正确做法
await StorageHelper.setJSON(STORAGE_KEYS.METHODS, data)
```

### 2. 检查 Electron 环境

```typescript
// 应用启动时检查
if (!window.electronAPI) {
  console.error('必须在 Electron 环境中运行！')
  return
}
```

### 3. IPC 调用是异步的

```typescript
// ✅ 使用 async/await
const data = await window.electronAPI.fs.readAppData('key')

// ❌ 不要假设同步
const data = window.electronAPI.fs.readAppData('key') // 这是 Promise！
```

## 常见问题

### Q: 为什么刷新后数据丢失？
A: 检查是否正确调用了 `StorageHelper.setJSON`，确保数据写入到 `app_data.json`。

### Q: 能否在浏览器中运行？
A: **不能**。本应用依赖 Electron 的文件系统和加密功能。

### Q: 数据保存在哪里？
A: 
- Windows: `C:\Users\<用户名>\AppData\Roaming\hplc-green-chemistry-app\`
- macOS: `~/Library/Application Support/hplc-green-chemistry-app/`
- Linux: `~/.config/hplc-green-chemistry-app/`

### Q: 如何备份数据？
A: 直接复制上述目录中的 `app_data.json` 和 `users.json` 文件。

## 相关文档

- [桌面存储架构](./DESKTOP_STORAGE_ARCHITECTURE.md)
- [文件系统实现](./FILE_SYSTEM_IMPLEMENTATION.md)
- [安装指南](./INSTALLATION.md)
- [快速开始](./QUICK_START.md)
