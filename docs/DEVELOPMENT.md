# 开发指南

## 项目架构详解

### 后端架构

#### 1. 目录结构
```
backend/
├── app/
│   ├── api/                    # API路由层
│   │   └── routes.py          # 定义所有API端点
│   ├── core/                   # 核心配置
│   │   └── config.py          # 应用配置管理
│   ├── database/               # 数据库层
│   │   ├── connection.py      # 数据库连接管理
│   │   └── models.py          # SQLAlchemy模型
│   ├── schemas/                # 数据模型
│   │   └── schemas.py         # Pydantic模型
│   └── services/               # 业务逻辑层
│       └── green_chemistry.py # 绿色化学分析核心算法
├── data/                       # 数据存储
├── main.py                     # 应用入口
└── requirements.txt            # 依赖列表
```

#### 2. API端点说明

**绿色化学评估**
- `POST /api/v1/green-chemistry/solvent-score` - 计算溶剂评分
- `POST /api/v1/green-chemistry/eco-scale` - 计算Eco-Scale评分

**色谱分析**
- `POST /api/v1/analysis/chromatogram` - 分析色谱图

**HPLC分析管理**
- `POST /api/v1/analysis/hplc` - 创建分析记录
- `GET /api/v1/analysis/hplc` - 获取分析列表

**溶剂数据库**
- `GET /api/v1/solvents/list` - 获取溶剂列表

### 前端架构

#### 1. 目录结构
```
frontend/
├── src/
│   ├── pages/                  # 页面组件
│   │   ├── HomePage.tsx       # 首页
│   │   ├── GreenChemistryPage.tsx  # 绿色化学评估页
│   │   ├── ChromatogramPage.tsx    # 色谱图分析页
│   │   └── AnalysisListPage.tsx    # 分析记录列表页
│   ├── services/              # API服务层
│   │   └── api.ts            # API封装
│   ├── App.tsx               # 主应用组件
│   ├── main.tsx              # 入口文件
│   └── index.css             # 全局样式
├── index.html
├── package.json
└── vite.config.ts
```

#### 2. 页面组件说明

- **HomePage**: 展示系统概览和统计信息
- **GreenChemistryPage**: 溶剂系统评分计算界面
- **ChromatogramPage**: 色谱图数据输入和分析
- **AnalysisListPage**: 历史分析记录查看

## 开发规范

### 后端开发规范

1. **使用异步编程**
```python
async def get_data():
    async with AsyncSessionLocal() as session:
        result = await session.execute(query)
        return result.scalars().all()
```

2. **错误处理**
```python
try:
    result = await some_operation()
except Exception as e:
    raise HTTPException(status_code=400, detail=str(e))
```

3. **数据验证**
使用Pydantic进行请求数据验证

### 前端开发规范

1. **组件结构**
```tsx
import React, { useState } from 'react'
import { Card, Button } from 'antd'

const MyComponent: React.FC = () => {
  const [state, setState] = useState(initialState)
  
  return <Card>...</Card>
}

export default MyComponent
```

2. **API调用**
```tsx
const handleSubmit = async () => {
  try {
    const response = await api.someMethod(data)
    message.success('成功')
  } catch (error) {
    message.error('失败')
  }
}
```

## 扩展开发

### 添加新的绿色化学指标

1. 在 `backend/app/services/green_chemistry.py` 中添加计算方法
2. 在 `backend/app/schemas/schemas.py` 中定义请求/响应模型
3. 在 `backend/app/api/routes.py` 中添加API端点
4. 在前端创建相应的UI组件

### 添加新的溶剂

在 `green_chemistry.py` 的 `SOLVENT_DATABASE` 中添加：
```python
SOLVENT_DATABASE = {
    "新溶剂": SolventProperties(
        name="新溶剂",
        hazard_score=5.0,
        environmental_impact=4.0,
        health_hazard=5.0,
        recyclability=7.0
    ),
    # ...其他溶剂
}
```

### 自定义数据库模型

1. 在 `backend/app/database/models.py` 添加新模型
2. 运行应用以自动创建表
3. 创建相应的CRUD操作

## 调试技巧

### 后端调试

1. 启用DEBUG模式（`.env`中设置`DEBUG=True`）
2. 查看SQLAlchemy日志
3. 使用Swagger UI测试API

### 前端调试

1. 使用React DevTools
2. 检查Network面板查看API请求
3. 使用console.log输出调试信息

## 性能优化

### 后端优化

- 使用异步数据库操作
- 添加数据库索引
- 实现缓存机制
- 使用连接池

### 前端优化

- 使用React.memo优化渲染
- 实现虚拟滚动
- 代码分割和懒加载
- 压缩打包资源

## 测试

### 后端测试

```bash
cd backend
pytest
```

### 前端测试

```bash
cd frontend
npm run test
```

## 常见问题

### Q: 后端启动失败？
A: 检查Python版本（需要3.10+）和依赖安装

### Q: 前端无法连接后端？
A: 检查CORS配置和API_URL设置

### Q: Electron打包失败？
A: 确保前后端都已正确构建

## 更新日志

### v1.0.0 (2025-11-05)
- 初始版本发布
- 实现基础绿色化学评估功能
- 实现色谱图分析功能
- 支持桌面应用打包
