# 安装和运行指南

## 前置要求

### 必需软件

1. **Node.js** (v18.0.0 或更高)
   - 下载: https://nodejs.org/
   - 验证安装: `node --version`

2. **Python** (v3.10 或更高)
   - 下载: https://www.python.org/downloads/
   - 验证安装: `python --version`

3. **npm** (通常随Node.js安装)
   - 验证安装: `npm --version`

### 推荐软件

- **Git** - 版本控制
- **VS Code** - 代码编辑器
- **Postman** - API测试工具

## 完整安装步骤

### 第一步: 下载项目

```bash
# 如果使用Git
git clone <repository-url>
cd HPLC_improve

# 或直接解压下载的ZIP文件
```

### 第二步: 安装根依赖

```bash
# 在项目根目录
npm install
```

这将安装Electron和相关打包工具。

### 第三步: 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
cd ..
```

**可能遇到的问题:**

如果安装失败，尝试：
```bash
# Windows
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# macOS/Linux
pip3 install --upgrade pip
pip3 install -r requirements.txt
```

### 第四步: 安装前端依赖

```bash
cd frontend
npm install
cd ..
```

**如果安装慢:**
```bash
# 使用国内镜像
npm install --registry=https://registry.npmmirror.com
```

### 第五步: 配置环境变量

#### 后端配置

```bash
# 复制示例配置文件
cp backend/.env.example backend/.env

# 编辑 backend/.env 文件（可选，默认配置可直接使用）
```

#### 前端配置

前端的 `.env` 文件已经创建，默认配置：
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## 运行应用

### 方式1: 分别启动（推荐用于开发）

**终端1 - 启动后端服务**
```bash
cd backend
python main.py
```

看到以下输出表示成功：
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**终端2 - 启动前端开发服务器**
```bash
cd frontend
npm run dev
```

看到以下输出表示成功：
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Electron 桌面应用窗口将自动打开

**终端3 - （可选）启动Electron**
```bash
# 在根目录
npm run electron:dev
```

### 方式2: 一键启动Electron（包含前后端）

```bash
# 在根目录
npm run electron:dev
```

这会自动启动前端和Electron窗口，但需要手动启动后端。

## 验证安装

### 1. 检查后端

访问 http://localhost:8000/docs

应该能看到Swagger UI界面，显示所有API端点。

### 2. 检查前端

访问 http://localhost:5173

应该能看到应用主界面，包括：
- 侧边栏导航菜单
- 首页统计信息
- 各功能模块

### 3. 测试功能

1. 点击"绿色化学评估"
2. 选择两个溶剂（如：水 和 甲醇）
3. 输入比例和体积
4. 点击"计算"
5. 查看评分结果

## 常见问题排查

### 问题1: 后端无法启动

**错误: `ModuleNotFoundError: No module named 'fastapi'`**

解决方案:
```bash
cd backend
pip install -r requirements.txt
```

**错误: 端口8000已被占用**

解决方案:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>

# 或修改 backend/.env 中的 PORT 配置
```

### 问题2: 前端无法启动

**错误: `Cannot find module 'vite'`**

解决方案:
```bash
cd frontend
rm -rf node_modules
npm install
```

**错误: 端口5173已被占用**

修改 `frontend/vite.config.ts`:
```typescript
server: {
  port: 5174,  // 改为其他端口
  // ...
}
```

### 问题3: Python版本过低

检查版本:
```bash
python --version
```

需要Python 3.10或更高。如果版本过低：
- Windows: 从python.org下载安装
- macOS: 使用 `brew install python@3.11`
- Linux: 使用包管理器 `sudo apt install python3.11`

### 问题4: Node版本过低

检查版本:
```bash
node --version
```

需要Node.js 18或更高。更新方法：
- 从 nodejs.org 下载最新LTS版本
- 或使用 nvm: `nvm install 18`

### 问题5: npm install 失败

尝试以下步骤:
```bash
# 清理缓存
npm cache clean --force

# 删除lock文件
rm package-lock.json
rm -rf node_modules

# 重新安装
npm install
```

### 问题6: 数据库相关错误

删除数据库重新创建:
```bash
rm backend/data/hplc_analysis.db
# 重新启动后端，数据库会自动创建
```

## Windows特定说明

### 使用PowerShell

如果使用PowerShell，某些命令可能需要调整：

```powershell
# 复制文件
Copy-Item backend\.env.example backend\.env

# 删除目录
Remove-Item -Recurse -Force node_modules
```

### 执行策略问题

如果遇到"无法加载脚本"错误：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## macOS/Linux特定说明

### 权限问题

如果遇到权限错误：
```bash
# 使用 pip 用户模式安装
pip install --user -r requirements.txt

# 或使用虚拟环境
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

## 使用虚拟环境（推荐）

### 创建虚拟环境

```bash
# Windows
cd backend
python -m venv venv
venv\Scripts\activate

# macOS/Linux
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 安装依赖

```bash
pip install -r requirements.txt
```

### 退出虚拟环境

```bash
deactivate
```

## 开发工具配置

### VS Code推荐插件

- Python
- Pylance
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)

### VS Code配置

创建 `.vscode/settings.json`:
```json
{
  "python.defaultInterpreterPath": "./backend/venv/bin/python",
  "python.linting.enabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 下一步

安装完成后，请查看：
1. **QUICK_START.md** - 快速开始指南
2. **docs/DEVELOPMENT.md** - 开发文档
3. **docs/USER_GUIDE.md** - 用户手册

## 获取帮助

如果遇到问题：
1. 检查本文档的"常见问题"部分
2. 查看项目文档
3. 提交Issue到GitHub
4. 联系技术支持
