# 快速开始指南

## 开发环境设置

### 1. 安装依赖

**根目录**
```bash
npm install
```

**后端**
```bash
cd backend
pip install -r requirements.txt
```

**前端**
```bash
cd frontend
npm install
```

### 2. 配置环境变量

**后端 (backend/.env)**
```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env` 根据需要修改配置。

**前端 (frontend/.env)**
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. 启动开发服务器

**方式1: 分别启动**

终端1 - 后端:
```bash
cd backend
python main.py
```

终端2 - 前端:
```bash
cd frontend
npm run dev
```

**方式2: 使用Electron**
```bash
npm run electron:dev
```

### 4. 访问应用

- 前端: http://localhost:5173
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 生产环境部署

### 1. 构建前端
```bash
cd frontend
npm run build
```

### 2. 打包Electron应用
```bash
npm run electron:build
```

### 3. 分发应用

构建完成后，在 `dist/` 目录找到安装包：
- Windows: `.exe` 安装程序
- macOS: `.dmg` 镜像
- Linux: `.AppImage` 或 `.deb`

## 常用命令

```bash
# 安装根依赖
npm install

# 开发模式运行Electron
npm run electron:dev

# 构建Electron应用
npm run electron:build

# 运行前端开发服务器
npm run frontend:dev

# 构建前端
npm run frontend:build

# 运行后端
npm run backend:dev
```

## 故障排除

### 端口冲突
如果8000或5173端口被占用，请修改相应的配置文件。

### 依赖安装失败
尝试清理缓存后重新安装：
```bash
npm cache clean --force
npm install
```

### Python版本问题
确保使用Python 3.10或更高版本：
```bash
python --version
```

## 下一步

- 查看完整文档: `docs/DEVELOPMENT.md`
- 阅读用户手册: `docs/USER_GUIDE.md`
- 参考API文档: http://localhost:8000/docs
