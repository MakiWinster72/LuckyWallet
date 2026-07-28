# 快速启动

本页用于在本地开发环境首次运行 LuckyWallet。若使用容器，请直接阅读[部署手册](/deployment#docker-compose-部署)。

## 环境要求

| 工具    | 版本要求 | 用途                  |
| ------- | -------- | --------------------- |
| MySQL   | 8.0+     | 业务数据              |
| Python  | 3.12+    | 后端运行时            |
| uv      | latest   | Python 依赖和虚拟环境 |
| Node.js | 20+      | 前端与文档构建        |

可选：页面内的 Claude Code 助手要求本机已安装并登录 Claude Code CLI。未配置该能力不影响账单、预算和统计功能。

Windows 用户如果尚未安装 `uv`，可以使用 PowerShell 执行：

```powershell
winget install --id=astral-sh.uv -e
```

安装完成后重新打开终端，并运行 `uv --version` 确认安装成功。若系统没有 `winget`，也可以在已配置 Python 和 pip 的情况下执行 `python -m pip install uv`。

## 1. 初始化数据库

确认 MySQL 已启动，在项目根目录依次执行：

```bash
mysql -u root -p < sql/001_init_luckywallet.sql
# 初始化数据库，并且创建 admin, 密码 admin123
# 应当创建新的管理员用户后删除 admin

# 以下为 demo 数据，可选
mysql -u root -p luckywallet_dev < sql/002_seed_demo_users.sql
mysql -u root -p luckywallet_dev < sql/003_seed_demo_bills.sql
```

> 也可以把 root 改为你的用户

## 2. 配置后端

进入 `backend`，复制环境变量模板：

::: code-group

```bash [Linux / macOS]
cd backend
cp .env.example .env
```

```powershell [Windows PowerShell]
cd backend
Copy-Item .env.example .env
```

:::

编辑 `backend/.env`：

```dotenv
DATABASE_URL=mysql+pymysql://用户名:你的数据库密码@127.0.0.1:端口/luckywallet_dev
JWT_SECRET=至少32个字符的随机密钥，请勿使用示例值
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
```

安装依赖并启动后端：

```bash
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

通过 <http://127.0.0.1:8000/health> 检查数据库连接；返回 `{"status":"ok"}` 表示后端可用。  
Swagger UI 位于 <http://127.0.0.1:8000/docs>。

## 3. 启动前端

另开一个终端，在项目根目录执行：

```bash
cd frontend
npm install
npm run dev
```

访问 `http://localhost:5173`。开发服务器默认通过 Vite 代理访问 `/api/v1`，通常不需要创建 `frontend/.env`。若后端运行在其他地址，可复制 `.env.example` 并修改 `VITE_API_BASE_URL`。

## 4. 登录演示账号

执行 `002_seed_demo_users.sql` 后，可以使用：

| 用户名        | 密码       | 角色     |
| ------------- | ---------- | -------- |
| `MakiWinster` | `maki1234` | 管理员   |
| `Ula`         | `ula12345` | 普通用户 |
| `Anna`        | `anna1234` | 普通用户 |

## 创建管理员

如果没有导入演示用户，可在后端已正确配置数据库后执行：

```bash
cd backend
uv run python -m scripts.create_admin --username admin --nickname 管理员
```

命令会交互式要求输入两次密码，密码至少 8 个字符。

## 可选：启动 Claude Code 助手

本地后端通过系统中的 `claude` 命令提供对话能力。先确认：

```bash
claude --version
```

并按 Claude Code CLI 的提示完成登录。助手从项目根目录运行：普通用户使用 `plan` 只读模式；管理员使用 `auto` 模式，可能直接修改项目文件或执行命令。只应向可信管理员开放该能力。

## 常见启动问题

### 后端提示缺少配置

确认文件位于 `backend/.env`，且 `DATABASE_URL` 与 `JWT_SECRET` 均已填写。`JWT_SECRET` 至少需要 32 个字符。

### `/health` 返回 500 或数据库连接失败

检查 MySQL 服务、端口、账号密码和 `luckywallet_dev` 是否存在。也可先使用 MySQL 客户端验证同一账号能否登录。

### 前端页面无法加载数据

确认后端监听 `127.0.0.1:8000`，然后检查浏览器网络面板中的 `/api/v1` 请求。自定义前端域名或端口时，也要同步修改 `FRONTEND_ORIGIN`。

### 登录后很快返回登录页

JWT 默认有效期为 30 分钟，可通过 `ACCESS_TOKEN_EXPIRE_MINUTES` 调整。修改后需要重启后端并重新登录。
