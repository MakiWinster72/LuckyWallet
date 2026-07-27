## 启动前端

在 frontend 文件夹使用

```bash
cd frontend

npm install

npm run dev
```

这里终端会提示在哪里访问页面，一般是 <http://localhost:5173>

> 修改颜色的话到这一步就可以了

## 初始化数据库

确保 MySQL 已启动后，在项目的 `sql` 目录执行：

```bash
cd sql
mysql -u root -p luckywallet_dev < 004_reset_database.sql
```

该脚本会重建本地数据库，并执行 `001`、`002`、`003`。其中 `avatar_url` 和 `household_settings` 已合并到 `001`，不要再单独执行旧的 `003`、`004`。

示例账号：`MakiWinster / maki1234`、`Ula / ula12345`、`Anna / anna1234`。

> 该 reset 脚本会删除 `luckywallet_dev` 中的全部数据，仅适用于本地开发环境。

## 启动后端

```bash
cd backend

uv sync

uv run uvicorn app.main:app --reload --port 8000
```
