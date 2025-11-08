# HPLC绿色化学分析系统 - 后端服务

基于FastAPI的后端API服务，提供绿色化学评估和HPLC数据分析功能。

## 安装依赖

```bash
pip install -r requirements.txt
```

## 运行服务

```bash
python main.py
```

服务将在 http://localhost:8000 启动

## API文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 配置

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

## 数据库

使用SQLite数据库，自动创建在 `data/` 目录下。

## 测试

```bash
pytest
```
