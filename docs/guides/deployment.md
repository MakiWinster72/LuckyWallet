# 部署手册

LuckyWallet 支持本地进程部署和 Docker Compose 部署。

## 配置项

### 后端

| 变量                          | 必填 | 默认值                  | 说明                           |
| ----------------------------- | :--: | ----------------------- | ------------------------------ |
| `DATABASE_URL`                |  是  | 无                      | SQLAlchemy MySQL 连接串        |
| `JWT_SECRET`                  |  是  | 无                      | JWT 签名密钥，至少 32 个字符   |
| `JWT_ALGORITHM`               |  否  | `HS256`                 | JWT 签名算法                   |
| `ACCESS_TOKEN_EXPIRE_MINUTES` |  否  | `30`                    | 登录令牌有效分钟数，必须大于 0 |
| `FRONTEND_ORIGIN`             |  否  | `http://localhost:5173` | 唯一允许的浏览器跨域来源       |

### 前端

| 变量                | 使用阶段 | 说明                                                        |
| ------------------- | -------- | ----------------------------------------------------------- |
| `VITE_API_BASE_URL` | 构建时   | API 前缀；本地开发默认 `/api/v1`，Docker 构建使用 `/api/v1` |

`VITE_API_BASE_URL` 会写入前端构建产物。修改后需要重新执行 `npm run build` 或重建镜像。

## 手动部署

按照[快速启动](/guides/how_to_start)完成数据库和后端配置，然后分别启动：

```bash
cd backend
uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

```bash
cd frontend
npm ci
VITE_API_BASE_URL=https://example.com/api/v1 npm run build
```

将 `frontend/dist` 交给 Nginx 等静态服务器，并完成以下反向代理：

| 路径        | 上游            | 额外要求                               |
| ----------- | --------------- | -------------------------------------- |
| `/api/`     | FastAPI `:8000` | 支持普通 HTTP 请求和 WebSocket Upgrade |
| `/uploads/` | FastAPI `:8000` | 保留上传头像路径                       |
| 其他路径    | `frontend/dist` | 未命中静态文件时回退到 `index.html`    |

仓库中的 `frontend/nginx.conf` 可作为配置参考。

## Docker Compose 部署

### 1. 准备环境变量

在项目根目录复制模板：

::: code-group

```bash [Linux / macOS]
cp .env.docker .env
```

```powershell [Windows PowerShell]
Copy-Item .env.docker .env
```

:::

至少替换以下值：

```dotenv
DB_ROOT_PASSWORD=数据库root密码
DB_NAME=luckywallet
DB_USER=luckywallet
DB_PASSWORD=应用数据库密码
JWT_SECRET=至少32个字符的独立随机密钥
FRONTEND_ORIGIN=https://你的域名
```

在本机通过 `http://localhost` 访问时，`FRONTEND_ORIGIN` 保持 `http://localhost`。

### 2. 检查并启动

```bash
docker compose config
docker compose up -d --build
docker compose ps
```

Compose 会启动：

- `db`：MySQL 8，数据保存在 `db-data` 卷；
- `backend`：FastAPI，头像保存在 `uploads` 卷；
- `frontend`：Nginx 静态站点和 API 反向代理，对外监听 80 端口。

首次创建空数据库卷时，MySQL 会执行 `sql/` 下的初始化脚本。用以下命令检查状态：

```bash
docker compose logs -f backend
docker compose logs -f db
curl http://localhost:8000/health
```

### 3. Claude Code 助手

后端镜像已安装 Claude Code CLI，并将宿主机的 `${HOME}/.claude` 挂载到容器。启动前应先在宿主机完成 Claude Code 登录，并确认 Compose 能解析 `HOME`。

::: danger 管理员执行权限
普通用户的助手使用 `plan` 只读模式；管理员使用 `auto` 模式，可能修改挂载的项目文件或执行命令。公开部署前应评估这一能力，不应给不可信账号授予管理员角色。
:::

不使用助手时，核心记账功能仍可正常工作；对话入口会因 CLI 凭据不可用而无法建立有效会话。

## 运维命令

查看日志：

```bash
docker compose logs -f
docker compose logs -f backend
```

停止服务并保留数据：

```bash
docker compose down
```

更新代码后重建：

```bash
docker compose up -d --build
```

::: danger 删除持久化数据
`docker compose down -v` 会删除数据库和头像数据卷。仅在明确需要清空全部 Docker 数据时执行。
:::
