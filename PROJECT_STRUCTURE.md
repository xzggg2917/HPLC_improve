# 项目完整结构

```
HPLC_improve/
│
├── backend/                           # 后端服务 (FastAPI + Python)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py             # API路由定义
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py             # 配置管理
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── connection.py         # 数据库连接
│   │   │   └── models.py             # 数据模型
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py            # Pydantic数据模型
│   │   └── services/
│   │       ├── __init__.py
│   │       └── green_chemistry.py    # 绿色化学分析核心
│   ├── data/                          # 数据存储目录 (自动创建)
│   ├── main.py                        # FastAPI应用入口
│   ├── requirements.txt               # Python依赖
│   ├── .env.example                   # 环境变量示例
│   └── README.md                      # 后端说明文档
│
├── frontend/                          # 前端应用 (React + Vite + TypeScript)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx          # 首页
│   │   │   ├── GreenChemistryPage.tsx # 绿色化学评估页
│   │   │   ├── ChromatogramPage.tsx  # 色谱图分析页
│   │   │   └── AnalysisListPage.tsx  # 分析记录列表页
│   │   ├── services/
│   │   │   └── api.ts                # API服务封装
│   │   ├── App.tsx                   # 主应用组件
│   │   ├── App.css                   # 应用样式
│   │   ├── main.tsx                  # React入口
│   │   └── index.css                 # 全局样式
│   ├── index.html                     # HTML模板
│   ├── package.json                   # 前端依赖
│   ├── tsconfig.json                  # TypeScript配置
│   ├── tsconfig.node.json             # Node TypeScript配置
│   ├── vite.config.ts                 # Vite配置
│   ├── .env                           # 环境变量
│   └── README.md                      # 前端说明文档
│
├── electron/                          # Electron桌面应用配置
│   ├── main.js                        # Electron主进程
│   └── preload.js                     # 预加载脚本
│
├── docs/                              # 文档目录
│   ├── DEVELOPMENT.md                 # 开发指南
│   └── USER_GUIDE.md                  # 用户手册
│
├── build/                             # 构建资源 (需要手动添加图标)
│   ├── icon.ico                       # Windows图标
│   ├── icon.icns                      # macOS图标
│   └── icon.png                       # Linux图标
│
├── dist/                              # 打包输出目录 (自动生成)
│   ├── win-unpacked/                  # Windows未打包版本
│   ├── *.exe                          # Windows安装程序
│   ├── *.dmg                          # macOS镜像
│   └── *.AppImage                     # Linux AppImage
│
├── package.json                       # 根package.json (Electron配置)
├── .gitignore                         # Git忽略规则
├── README.md                          # 项目主文档
├── QUICK_START.md                     # 快速开始指南
└── LICENSE                            # MIT许可证

```

## 核心文件说明

### 后端核心文件

1. **main.py** - FastAPI应用入口，定义服务器配置
2. **app/api/routes.py** - 所有API端点定义
3. **app/services/green_chemistry.py** - 绿色化学分析算法实现
4. **app/database/models.py** - 数据库表结构定义
5. **app/schemas/schemas.py** - 请求/响应数据模型

### 前端核心文件

1. **src/main.tsx** - React应用入口
2. **src/App.tsx** - 主应用组件，包含路由和布局
3. **src/pages/*.tsx** - 各功能页面组件
4. **src/services/api.ts** - 后端API调用封装
5. **vite.config.ts** - Vite构建工具配置

### Electron核心文件

1. **electron/main.js** - Electron主进程，管理窗口和后端进程
2. **electron/preload.js** - 渲染进程预加载脚本
3. **package.json** - Electron打包配置

## 技术栈总结

### 后端
- **语言**: Python 3.10+
- **框架**: FastAPI 0.104+
- **数据库**: SQLite + SQLAlchemy (异步)
- **数据处理**: NumPy, Pandas, SciPy
- **数据验证**: Pydantic

### 前端
- **语言**: TypeScript 5.2+
- **框架**: React 18
- **构建工具**: Vite 5
- **UI库**: Ant Design 5
- **图表**: Recharts
- **HTTP客户端**: Axios
- **路由**: React Router 6

### 桌面应用
- **框架**: Electron 27+
- **打包工具**: electron-builder

## 数据流

```
用户界面 (React)
    ↓
API调用 (Axios)
    ↓
FastAPI路由 (routes.py)
    ↓
业务逻辑 (services/)
    ↓
数据库 (SQLite + SQLAlchemy)
```

## 开发流程

1. **后端开发**
   - 在 `app/services/` 添加业务逻辑
   - 在 `app/schemas/` 定义数据模型
   - 在 `app/api/routes.py` 添加API端点
   - 在 `app/database/models.py` 添加数据表

2. **前端开发**
   - 在 `src/pages/` 创建页面组件
   - 在 `src/services/api.ts` 添加API调用
   - 在 `src/App.tsx` 添加路由

3. **测试**
   - 后端: 使用 Swagger UI 测试API
   - 前端: 浏览器开发者工具
   - 集成: Electron开发模式

4. **打包发布**
   - 构建前端: `npm run frontend:build`
   - 打包Electron: `npm run electron:build`
   - 生成安装包在 `dist/` 目录

## 配置文件说明

- **backend/.env** - 后端环境变量（数据库、密钥等）
- **frontend/.env** - 前端环境变量（API地址）
- **package.json** - 项目依赖和构建脚本
- **tsconfig.json** - TypeScript编译选项
- **vite.config.ts** - Vite开发服务器和构建配置

## 运行模式

### 开发模式
- 后端: Python直接运行，支持热重载
- 前端: Vite开发服务器，支持HMR
- 数据库: SQLite文件数据库

### 生产模式
- 后端: 可选PyInstaller打包成exe
- 前端: 构建为静态文件
- 应用: Electron打包为安装程序
