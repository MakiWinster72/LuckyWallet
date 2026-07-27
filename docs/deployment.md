# 部署手册

本文介绍 LuckyWallet 的本地开发部署和 Docker 部署方式。

## 运行环境

- MySQL 8.0+
- Python 3.12+
- `uv`
- Node.js 20+
- npm
- Docker Desktop（仅 Docker 部署需要）

## 本地开发部署

### 1. 初始化数据库

确保 MySQL 已启动，在项目根目录进入 `sql` 文件夹：

```bash
cd sql
mysql -u root -p luckywallet_dev < 001_init_luckywallet.sql
mysql -u root -p luckywallet_dev < 002_seed_demo_users.sql
mysql -u root -p luckywallet_dev < 003_seed_demo_bills.sql
```

如果需要完全重置本地数据库，可以执行：

```bash
mysql -u root -p luckywallet_dev < 004_reset_database.sql
```

`004_reset_database.sql` 会删除并重建 `luckywallet_dev`，仅用于开发环境。

### 2. 配置后端

进入 `backend`，创建 `.env` 文件：

```env
DATABASE_URL=mysql+pymysql://root:你的密码@127.0.0.1:3306/luckywallet_dev
JWT_SECRET=请替换为随机且足够长的密钥
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
```

安装依赖并启动：

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Windows 使用 `--reload` 时，必须从 `backend` 目录启动，并确认 `.env` 位于 `backend/.env`。

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端地址通常是 <http://localhost:5173>，后端 API 地址是 <http://127.0.0.1:8000>。

## Docker 部署

在项目根目录创建 `.env`：

```env
DB_ROOT_PASSWORD=修改为强密码
DB_NAME=luckywallet
DB_USER=luckywallet
DB_PASSWORD=修改为强密码
JWT_SECRET=修改为随机且足够长的密钥
FRONTEND_ORIGIN=http://localhost
```

启动全部服务：

```bash
docker compose up -d --build
```

访问 <http://localhost>。查看日志：

```bash
docker compose logs -f backend
docker compose logs -f db
```

停止服务但保留数据库：

```bash
docker compose down
```

停止服务并删除数据库卷（会丢失全部 Docker 数据）：

```bash
docker compose down -v
```

## 发布前检查

```bash
cd frontend
npm run lint
npm run build

cd ../backend
uv run pytest
```

生产环境应使用独立数据库、强随机 `JWT_SECRET`，并通过 HTTPS 暴露前端服务。
