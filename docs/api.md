# API 接口文档

LuckyWallet 后端基于 FastAPI 实现，所有业务路由统一挂载在 `/api/v1` 前缀下。开发环境下后端地址为 `http://127.0.0.1:8000`，生产环境由部署决定。

除了本文档，FastAPI 还会自动生成交互式文档：

- Swagger UI：<http://127.0.0.1:8000/docs>
- ReDoc：<http://127.0.0.1:8000/redoc>

> 自动文档可用来在线调试，本文档侧重于鉴权约定、错误模型与每个端点的业务语义，便于前端联调与编写集成测试。

## 通用约定

### 基础信息

| 项 | 值 |
| --- | --- |
| Base URL | `/api/v1` |
| 请求体格式 | `application/json`（账单上传为 `multipart/form-data`） |
| 响应体格式 | `application/json` |
| 字符编码 | UTF-8 |
| 时间格式 | ISO 8601，如 `2026-07-28T12:34:56.000000` |
| 日期格式 | `YYYY-MM-DD` |
| 金额格式 | 字符串形式的 `DECIMAL(10,2)`，例如 `"12.50"` |

::: tip 金额序列化为字符串
Pydantic 默认把 `Decimal` 序列化成字符串，因此响应里 `amount`、`share_amount`、`monthly_budget` 等字段都是字符串。前端做运算时请先转成数字。
:::

### 鉴权

除 `POST /auth/login` 与 `GET /health` 外，所有端点都要求在请求头携带 JWT：

```http
Authorization: Bearer <access_token>
```

令牌通过 `POST /auth/login` 获取，默认有效期 30 分钟（由 `ACCESS_TOKEN_EXPIRE_MINUTES` 控制），登录响应的 `expires_in` 字段以秒为单位。

鉴权失败统一返回 `401`：

```json
{
  "detail": {
    "code": "UNAUTHORIZED",
    "message": "登录状态已失效，请重新登录"
  }
}
```

触发条件：缺少/格式错误的 `Authorization` 头、令牌过期或无效、对应用户不存在或已被停用（`is_active = false`）。

### 角色与权限

| 角色 | 能力 |
| --- | --- |
| `user` | 登录、查看与录入账单、查看成员、查看统计、查看预算、上传本人头像 |
| `admin` | 在 `user` 全部能力之上，可管理用户、调整预算 |

需要管理员权限的端点在未授权或普通用户访问时返回 `403`：

```json
{
  "detail": {
    "code": "ADMIN_REQUIRED",
    "message": "需要管理员权限"
  }
}
```

### 错误响应模型

业务异常由后端主动抛出，响应体统一为：

```json
{
  "detail": {
    "code": "<ERROR_CODE>",
    "message": "<中文可读消息>"
  }
}
```

各端点可能返回的 `code` 见下文对应小节。

请求体校验失败（字段缺失、类型错误、长度越界等）由 Pydantic 自动拦截，返回 `422`，结构沿用 FastAPI 默认格式（注意 `detail` 是数组，而不是上面的对象）：

```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "amount"],
      "msg": "Input should be greater than 0",
      "input": "0"
    }
  ]
}
```

### 分摊金额计算规则

创建或更新账单时，后端按**平均分摊**自动计算每位参与人的 `share_amount`，前端无需也不应自行传入：

1. `base_share = floor(amount / 人数)`，向下保留两位小数；
2. 不足整分的余数 `remaining_cents = (amount - base_share * 人数) / 0.01`；
3. 余数按参与人顺序，前 `remaining_cents` 人各加 `0.01`。

因此同一笔账单的参与人分摊金额可能相差 `0.01`，所有分摊金额之和严格等于账单 `amount`。

---

## 认证

### POST /auth/login

用户名密码登录，签发 JWT。匿名端点。

**请求体**

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `username` | string | 1–50 字符 | 登录名，不区分大小写 |
| `password` | string | 1–128 字符 | 明文密码 |

```json
{ "username": "MakiWinster", "password": "maki1234" }
```

**201 响应** · `LoginResponse`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `access_token` | string | JWT |
| `token_type` | string | 固定 `bearer` |
| `expires_in` | int | 有效期（秒） |
| `user` | `UserResponse` | 当前用户信息 |

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "username": "MakiWinster",
    "nickname": "Maki",
    "avatar_url": "/uploads/avatar-1-xxx.png",
    "role": "admin",
    "is_active": true
  }
}
```

**错误**

| 状态码 | `code` | 触发条件 |
| --- | --- | --- |
| 401 | `INVALID_CREDENTIALS` | 用户名不存在或密码错误 |
| 422 | — | 请求体未通过校验 |

登录成功与失败都会写入 `audit_logs`，失败记录的 `user_id` 可能为空。

### GET /auth/me

返回当前登录用户。需登录。

**200 响应** · `UserResponse`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | int | 用户 ID |
| `username` | string | 登录名 |
| `nickname` | string\|null | 昵称 |
| `avatar_url` | string\|null | 头像路径，形如 `/uploads/...` |
| `role` | `"admin"`\|`"user"` | 角色 |
| `is_active` | bool | 启用状态 |

### POST /auth/me/avatar

上传当前用户头像。需登录。`multipart/form-data`。

**表单字段**

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `avatar` | file | 必填 | `image/jpeg`、`image/png` 或 `image/webp`，≤ 5 MB |

**200 响应** · `UserResponse`（含更新后的 `avatar_url`）

**错误**

| 状态码 | `code` | 触发条件 |
| --- | --- | --- |
| 400 | `EMPTY_AVATAR` | 文件内容为空 |
| 413 | `AVATAR_TOO_LARGE` | 超过 5 MB |
| 415 | `INVALID_AVATAR_TYPE` | Content-Type 不在允许列表 |
| 422 | — | 未提供 `avatar` 字段 |

上传成功后旧头像文件会被自动删除；头像通过静态路由 `GET /uploads/<filename>` 访问，无需鉴权。

---

## 账单

### GET /bills

查询账单列表，支持按日期区间与分类筛选。需登录。

**查询参数**

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `start_date` | date | `YYYY-MM-DD` | 起始日期（含），按 `bill_date` 过滤 |
| `end_date` | date | `YYYY-MM-DD` | 结束日期（含） |
| `category_id` | int | `> 0` | 分类 ID |

三个参数均可选；若同时提供 `start_date` 与 `end_date`，`start_date` 不能晚于 `end_date`。

**200 响应** · `BillResponse[]`

**错误**

| 状态码 | `code` | 触发条件 |
| --- | --- | --- |
| 422 | `INVALID_BILL_REFERENCE` | `start_date` 晚于 `end_date` |

### GET /bills/{bill_id}

查询单笔账单。需登录。

**路径参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `bill_id` | int | 账单 ID |

**200 响应** · `BillResponse`

**错误**

| 状态码 | `code` | 触发条件 |
| --- | --- | --- |
| 404 | `BILL_NOT_FOUND` | 账单不存在 |

### POST /bills

新建账单，分摊金额由后端按平均分摊算法自动计算。需登录；`created_by` 自动取当前用户。

**请求体** · `BillCreate`

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `title` | string | 1–100 字符 | 标题 |
| `amount` | decimal | `> 0`，最多 2 位小数 | 账单总金额 |
| `payer_id` | int | `> 0` | 实际付款人 ID |
| `bill_date` | date | — | 实际消费日期 |
| `category_id` | int | `> 0` | 分类 ID，必须为启用状态 |
| `participant_ids` | int[] | 至少 1 个，不可重复 | 参与人 ID 列表 |
| `note` | string\|null | ≤ 2000 字符 | 备注 |

```json
{
  "title": "超市采购",
  "amount": "120.00",
  "payer_id": 1,
  "bill_date": "2026-07-28",
  "category_id": 3,
  "participant_ids": [1, 2, 3],
  "note": "周末囤货"
}
```

**201 响应** · `BillResponse`

**错误**

| 状态码 | `code` | 触发条件 |
| --- | --- | --- |
| 422 | `INVALID_BILL_REFERENCE` | 分类不存在或已停用；付款人/参与人不存在或已停用 |

### PUT /bills/{bill_id}

整体更新账单。需登录。请求体与 `POST /bills` 相同（`BillUpdate`），分摊金额会按新的 `amount` 与 `participant_ids` 重新计算。

**响应与错误**：同 `POST /bills`，另增 `404 BILL_NOT_FOUND`。

### DELETE /bills/{bill_id}

删除账单。需登录。

**204 响应**：无响应体。

**错误**

| 状态码 | `code` | 触发条件 |
| --- | --- | --- |
| 404 | `BILL_NOT_FOUND` | 账单不存在 |

### BillResponse 结构

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | int | 账单 ID |
| `title` | string | 标题 |
| `amount` | decimal | 总金额 |
| `payer_id` | int | 付款人 ID |
| `bill_date` | date | 消费日期 |
| `category` | `CategoryResponse` | 分类对象 |
| `note` | string\|null | 备注 |
| `created_by` | int | 录入人 ID |
| `created_at` | datetime | 创建时间 |
| `participants` | `ParticipantResponse[]` | 分摊明细 |

`CategoryResponse`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | int | 分类 ID |
| `name` | string | 分类名 |
| `icon` | string\|null | Emoji 或图标键 |

`ParticipantResponse`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `user_id` | int | 参与人 ID |
| `share_amount` | decimal | 应承担金额 |

::: warning 没有独立的分类列表接口
当前不存在 `GET /categories` 端点，分类信息只随账单响应的 `category` 字段返回。如需独立的分类选择器，需要后端新增路由，参见 [数据库说明](/DATABASE) 中的 `categories` 表。
:::

---

## 成员

### GET /members

返回所有启用状态的成员，供新增账单时选择付款人与参与人。需登录。

**200 响应** · `MemberRead[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | int | 用户 ID |
| `username` | string | 登录名 |
| `nickname` | string\|null | 昵称 |
| `avatar_url` | string\|null | 头像路径 |

仅返回 `is_active = true` 的用户，不暴露角色、状态等敏感字段。

---

## 统计

### GET /statistics/monthly

返回某月份的支出汇总。需登录。

**查询参数**

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `month` | string | 正则 `^\d{4}-\d{2}$` | 月份，如 `2026-07` |

**200 响应** · `MonthlyStatisticsResponse`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `month` | string | 回显的月份 |
| `total` | decimal | 当月账单总金额 |
| `count` | int | 当月账单数 |
| `average` | decimal | 笔均金额，`count=0` 时为 `"0"` |
| `categories` | `StatisticsBreakdown[]` | 按分类的金额与笔数 |
| `payers` | `StatisticsBreakdown[]` | 按付款人的金额与笔数 |

`StatisticsBreakdown`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | int | 分类 ID 或付款人 ID |
| `name` | string | 分类名或付款人用户名 |
| `amount` | decimal | 汇总金额 |
| `count` | int | 账单数 |

统计按 `bill_date` 归入对应月份，不按账单创建时间归类。

**错误**

| 状态码 | `code` | 触发条件 |
| --- | --- | --- |
| 422 | `INVALID_MONTH` | 月份格式不合法或月份值不在 1–12 |

---

## 家庭设置

### GET /settings/budget

读取当前家庭月度预算。需登录。

**200 响应** · `BudgetRead`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `monthly_budget` | decimal | 月度预算 |

### PUT /settings/budget

更新月度预算。**需要管理员**。

**请求体** · `BudgetUpdate`

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `monthly_budget` | decimal | `> 0`，最多 2 位小数 | 新的月度预算 |

```json
{ "monthly_budget": "3000.00" }
```

**200 响应** · `BudgetRead`

**错误**

| 状态码 | `code` | 触发条件 |
| --- | --- | --- |
| 403 | `ADMIN_REQUIRED` | 非管理员 |
| 422 | — | 预算非正数或格式错误 |

---

## 管理员用户管理

所有端点前缀 `/admin/users`，**需要管理员**。

### GET /admin/users

返回全部用户（含停用用户）。

**200 响应** · `AdminUserRead[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | int | 用户 ID |
| `username` | string | 登录名 |
| `nickname` | string\|null | 昵称 |
| `avatar_url` | string\|null | 头像路径 |
| `role` | `"admin"`\|`"user"` | 角色 |
| `is_active` | bool | 启用状态 |
| `created_at` | datetime | 创建时间 |
| `updated_at` | datetime | 最后更新时间 |

### POST /admin/users

新建用户。密码使用 Argon2 哈希存储。

**请求体** · `AdminUserCreate`

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `username` | string | 3–50 字符，`^[A-Za-z0-9_.-]+$` | 登录名 |
| `password` | string | 8–128 字符 | 明文密码 |
| `nickname` | string | 1–50 字符，非空白 | 昵称 |
| `role` | `"admin"`\|`"user"` | 默认 `user` | 角色 |

**201 响应** · `AdminUserRead`

**错误**

| 状态码 | `code` | 触发条件 |
| --- | --- | --- |
| 409 | `USERNAME_EXISTS` | 用户名已存在 |

### PATCH /admin/users/{user_id}

局部更新用户。所有字段均可选。

**路径参数**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `user_id` | int | 用户 ID |

**请求体** · `AdminUserUpdate`

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `nickname` | string\|null | 1–50 字符，非空白 | 昵称 |
| `role` | `"admin"`\|`"user"`\|null | — | 角色 |
| `is_active` | bool\|null | — | 启用状态 |

**200 响应** · `AdminUserRead`

**错误**

| 状态码 | `code` | 触发条件 |
| --- | --- | --- |
| 404 | `USER_NOT_FOUND` | 用户不存在 |
| 409 | `SELF_PROTECTION` | 试图停用自己或撤销自己的管理员角色 |
| 409 | `LAST_ACTIVE_ADMIN` | 操作会导致没有任何启用的管理员 |

::: tip 保护规则
为避免锁死系统，禁止停用自己、撤销自己的管理员角色，也禁止移除系统里最后一个启用的管理员。
:::

---

## Claude Code WebSocket

### WS /ws/claude

页面内嵌的 Claude Code 对话通道。**不**在 `/api/v1` 前缀下。

**鉴权**：连接时通过查询参数携带 JWT：`ws://host/ws/claude?token=<JWT>`。令牌无效、过期或用户已停用会立即关闭连接（`1008`）并下发一条 `error` 帧。

**协议**：JSON 文本帧。

客户端 → 服务端：

| `type` | 说明 |
| --- | --- |
| `message` | 发送一条对话，字段 `content` 为文本 |
| `restore` | 恢复历史会话，字段 `history` 为 `[{role, text}]` 数组 |

服务端 → 客户端：

| `type` | 说明 |
| --- | --- |
| `status` | 连接就绪，`content` 提示当前模式 |
| `chunk` | 流式响应的一个片段，`content` 为文本 |
| `done` | 当前响应结束 |
| `error` | 出错，`content` 为错误消息 |

模式由角色决定：管理员为 `auto (yolo)`，普通用户为 `plan (只读)`。详见 `backend/app/api/routes/claude_code.py`。

---

## 健康检查

### GET /health

匿名端点，用于部署探活。会执行一次 `SELECT 1` 验证数据库连通性。

**200 响应**

```json
{ "status": "ok" }
```

---

## 端点速查表

| 方法 | 路径 | 鉴权 | 角色 | 说明 |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | — | — | 登录 |
| GET | `/api/v1/auth/me` | Bearer | 任意 | 当前用户 |
| POST | `/api/v1/auth/me/avatar` | Bearer | 任意 | 上传头像 |
| GET | `/api/v1/bills` | Bearer | 任意 | 账单列表 |
| GET | `/api/v1/bills/{bill_id}` | Bearer | 任意 | 账单详情 |
| POST | `/api/v1/bills` | Bearer | 任意 | 新建账单 |
| PUT | `/api/v1/bills/{bill_id}` | Bearer | 任意 | 更新账单 |
| DELETE | `/api/v1/bills/{bill_id}` | Bearer | 任意 | 删除账单 |
| GET | `/api/v1/members` | Bearer | 任意 | 启用成员 |
| GET | `/api/v1/statistics/monthly` | Bearer | 任意 | 月度统计 |
| GET | `/api/v1/settings/budget` | Bearer | 任意 | 读取预算 |
| PUT | `/api/v1/settings/budget` | Bearer | admin | 更新预算 |
| GET | `/api/v1/admin/users` | Bearer | admin | 用户列表 |
| POST | `/api/v1/admin/users` | Bearer | admin | 新建用户 |
| PATCH | `/api/v1/admin/users/{user_id}` | Bearer | admin | 更新用户 |
| WS | `/ws/claude` | token 查询参数 | 任意 | Claude 对话 |
| GET | `/health` | — | — | 健康检查 |
