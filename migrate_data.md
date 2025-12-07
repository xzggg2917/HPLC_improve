# 数据迁移指南

## 从浏览器 localStorage 迁移到 Electron

### 步骤1：从浏览器导出数据

1. 在浏览器打开 http://localhost:5173
2. 按 F12 打开开发者工具
3. 在 Console 中执行：

```javascript
// 导出用户数据
const users = localStorage.getItem('hplc_users')
console.log('用户数据:', users)

// 导出试剂库数据
const factors = localStorage.getItem('hplc_factors_data')
console.log('试剂库数据:', factors)

// 导出当前用户
const currentUser = localStorage.getItem('hplc_current_user')
console.log('当前用户:', currentUser)
```

4. 复制输出的 JSON 数据

### 步骤2：在 Electron 中导入数据

#### 方法A：通过开发者工具导入

1. 在 Electron 窗口中按 `Ctrl+Shift+I` 打开开发者工具
2. 在 Console 中执行：

```javascript
// 导入用户数据（替换成你复制的数据）
const usersData = [{"username":"admin","password":"hashed_password_here"}]
await window.electronAPI.fs.writeUsers(usersData)

// 导入试剂库数据
const factorsData = [...]  // 你的试剂数据
await window.electronAPI.fs.writeAppData('hplc_factors_data', factorsData)

// 导入当前用户
const currentUserData = {...}  // 你的用户数据
await window.electronAPI.fs.writeAppData('hplc_current_user', currentUserData)
```

#### 方法B：手动编辑文件

Electron 数据存储位置：
- Windows: `C:\Users\你的用户名\AppData\Roaming\hplc-improve\`

文件：
- `users.json` - 用户账号数据
- `app_data.json` - 应用数据（试剂库、当前用户等）

直接编辑这些文件即可。

### 步骤3：重启 Electron

关闭并重新打开 Electron 应用，数据应该已经迁移成功。

## 常见问题

### Q: 忘记密码怎么办？
A: 如果无法找到原密码，可以在 Electron 中创建新用户：
1. 打开 Electron 应用
2. 在登录页面注册新用户
3. 使用新用户登录

### Q: 浏览器中的文件能在 Electron 中打开吗？
A: 可以，但需要：
1. 确保用户账号已迁移（包括密码）
2. 文件内容格式相同
3. 使用 Electron 的"Open File"功能打开

### Q: 为什么不能继续使用浏览器？
A: 因为：
1. 应用已完全移除 localStorage 支持
2. Electron 提供更安全的文件系统存储
3. 浏览器无法访问本地文件系统（安全限制）
