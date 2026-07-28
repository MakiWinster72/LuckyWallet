# LuckyWallet

LuckyWallet 是一个为固定小团队设计的共同生活账本。它记录谁付款、谁参与，
并把每一笔共同消费的分摊结果清楚地呈现出来。

## 已实现

- JWT 登录与受保护路由
- 月度支出、预算进度和待结算概览
- 账单搜索、分类、付款人与参与成员展示
- 新增账单与平均分摊预览
- 浏览器本地持久化
- 深浅色主题与移动端布局
- MySQL 8 初始化结构、用户模型及安全测试

## 本地启动

前端：

```bash
cd frontend
npm install
npm run dev
```

后端：

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

## Docker 局域网启动

在项目根目录执行：

```bash
cp .env.example .env
# 编辑 .env，至少修改 DB_PASSWORD、DB_ROOT_PASSWORD 和 JWT_SECRET
docker compose up -d --build
```

Docker 前端会监听宿主机的 `80` 端口，局域网内其他设备访问：

```text
http://宿主机的局域网 IP/
```

例如宿主机 IP 是 `192.168.1.20`，则访问 `http://192.168.1.20/`。如果无法访问，检查操作系统防火墙是否放行 TCP `80` 端口。数据库数据保存在 Docker volume 中，初始化 SQL 只会在首次创建数据库 volume 时执行。

停止服务但保留数据：

```bash
docker compose down
```

完全重置 Docker 数据库（会删除所有数据）：

```bash
docker compose down -v
```

详细环境和数据库说明见 [docs/how_to_start.md](docs/how_to_start.md) 与
[docs/DATABASE.md](docs/DATABASE.md)。

## 质量检查

```bash
cd frontend && npm run lint && npm run build
cd backend && uv run pytest
```
