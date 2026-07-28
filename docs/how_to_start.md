## 启动后端

```bash
cd backend

uv sync

## env
cp .env.example .env
## 写好数据库账号密码

uv run uvicorn app.main:app --reload --port 8000
```

## 初始化数据库

确保 MySQL 已启动后，在项目的 `sql` 目录执行：

```bash
cd sql
mysql -u root -p < 001(TAB)
mysql -u root -p luckywallet_dev < 002(TAB)
mysql -u root -p luckywallet_dev < 003(TAB)
```

## 启动前端

在 frontend 文件夹使用

```bash
cd ../frontend

npm install

npm run dev
```
