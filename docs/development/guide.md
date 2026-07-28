# 开发指南

本页介绍 LuckyWallet 的代码结构、关键数据流和日常开发命令。首次运行项目请先完成[快速启动](/guides/how_to_start)。

## 系统结构

```text
浏览器
  ├─ HTTP /api/v1/* ───────────────┐
  └─ GET /uploads/* ────────────────┤
                                    ▼
React + Vite                FastAPI + SQLAlchemy
                                    │
                     ┌──────────────┼──────────────┐
                     ▼              ▼
                  MySQL 8       uploads/
```

开发环境中，Vite 将 `/api` 请求和 WebSocket 代理到 `127.0.0.1:8000`。Docker 环境由 Nginx 完成同样的代理。

## 目录职责

```text
backend/
├─ app/api/             路由、鉴权依赖和 HTTP/WebSocket 边界
├─ app/core/            JWT 与密码安全工具
├─ app/models/          SQLAlchemy ORM 模型
├─ app/repositories/    数据库查询和持久化
├─ app/schemas/         Pydantic 请求/响应模型
├─ app/services/        业务规则和领域计算
├─ app/runtime_schema.py 旧开发库的最小兼容处理
├─ scripts/             管理命令
└─ tests/               pytest 测试

frontend/
├─ src/api/             HTTP 客户端和 API 数据适配
├─ src/auth/            登录状态与受保护路由
├─ src/components/      账单、成员、用户管理和对话组件
├─ src/data/            统计、结算、筛选等纯数据逻辑
├─ src/pages/           登录页和工作台页面
├─ src/styles/          设计令牌与主题颜色
└─ tests/               Node 测试

sql/                    MySQL 初始化和演示数据
docs/                   VitePress 文档站
```

## 后端请求链路

典型业务请求按以下顺序处理：

1. `app/api/routes` 解析 HTTP 输入并注入当前用户与数据库会话；
2. `app/schemas` 使用 Pydantic 校验字段格式；
3. `app/services` 执行业务规则，例如账单引用校验和平均分摊；
4. `app/repositories` 通过 SQLAlchemy 读写 MySQL；
5. 路由将 ORM 对象按响应 Schema 序列化。

路由层负责协议和状态码，业务规则优先放在 Service，查询细节放在 Repository。新增接口时应保持这一边界。

## 鉴权与权限

- `POST /api/v1/auth/login` 使用用户名和密码换取 JWT；
- REST 请求通过 `Authorization: Bearer <token>` 鉴权；
- WebSocket 通过 `?token=<token>` 鉴权；
- `CurrentUser` 要求登录且账号启用；
- `AdminUser` 在此基础上要求 `role == "admin"`。

密码使用 Argon2 哈希。登录成功和失败都会写入 `audit_logs`。不要在日志、测试快照或错误响应中输出明文密码和 JWT。

## 金额与分摊

后端以 `Decimal` 和 MySQL `DECIMAL(10,2)` 处理金额，避免使用浮点数。创建或更新账单时，参与人由后端平均分摊：

```text
基础份额 = 总金额按人数平均后向下保留到分
剩余分币 = 总金额 - 基础份额之和
```

剩余分币按参与人输入顺序每人加 `0.01`，因此各份额最多相差一分钱，并且总和严格等于账单金额。

前端金额换算集中在 `src/utils/money.js` 和 `src/data` 的纯函数中。修改金额规则时，必须同时覆盖后端 Service 测试和前端数据测试。

## 数据库变更

完整的新数据库以 `sql/001_init_luckywallet.sql` 为准。当前仓库没有接入迁移框架；`runtime_schema.py` 只用于给早期开发库补齐头像字段和预算表，不应扩展成通用迁移系统。

修改表结构时至少需要同步：

1. SQLAlchemy 模型；
2. Pydantic Schema 与 Repository；
3. `001_init_luckywallet.sql`；
4. 受影响的演示数据和测试；
5. [数据库说明](/reference/DATABASE) 与 [API 文档](/reference/api)。

已上线环境应使用经过评审的正式迁移方案，不要通过删除数据库升级。

## 前端数据流

- `AuthContext` 维护当前用户和令牌状态；
- `src/api` 统一拼接 API 地址、附加 Bearer Token 并处理错误；
- API 返回对象先经过 adapter，再交给页面组件；
- 统计、分页、筛选和结算尽量保留为 `src/data` 中可独立测试的纯函数；
- `DashboardPage` 负责工作台视图编排，复用业务视图组件。

开发环境不设置 `VITE_API_BASE_URL` 时默认使用 `/api/v1`。生产构建必须显式配置，Dockerfile 已通过构建参数设置为 `/api/v1`。

## 测试与质量检查

### 后端

```bash
cd backend
uv sync
uv run pytest
```

后端测试覆盖安全工具、Schema、账单/预算/成员/统计服务、管理员接口和运行时表结构兼容。

### 前端

```bash
cd frontend
npm install
npm test
npm run lint
npm run build
```

`npm test` 使用 Node 内置测试运行器，主要验证 API adapter 和 `src/data` 的纯逻辑；`lint` 与生产构建用于捕获组件和打包问题。

### 文档

```bash
cd docs
npm install
npm run docs:dev
```

提交前构建一次文档站：

```bash
npm run docs:build
```

VitePress 构建产物位于 `docs/.vitepress/dist`，不提交到 Git。

## 联调入口

| 服务 | 默认地址 |
| --- | --- |
| 前端 | `http://localhost:5173` |
| 后端 | <http://127.0.0.1:8000> |
| 健康检查 | <http://127.0.0.1:8000/health> |
| Swagger UI | <http://127.0.0.1:8000/docs> |
| ReDoc | <http://127.0.0.1:8000/redoc> |
| 文档站 | VitePress 启动命令输出的本地地址 |

## 提交前检查

- 新增行为有对应测试，错误路径也有覆盖；
- API、Schema、前端 adapter 和文档中的字段保持一致；
- 没有提交 `.env`、令牌、数据库密码或上传文件；
- 金额运算没有引入二进制浮点误差；
- 管理员接口使用 `AdminUser`，普通接口至少使用 `CurrentUser`；
- 前端、后端和文档构建均通过。
