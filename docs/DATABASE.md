| 表名                | 中文名称   | 主要用途                         |
| ------------------- | ---------- | -------------------------------- |
| `users`             | 用户表     | 登录账号、昵称、角色和启用状态   |
| `categories`        | 分类表     | 餐饮、零食、日用品、聚会等分类   |
| `bills`             | 账单表     | 一笔共同消费的主体、金额和付款人 |
| `bill_participants` | 分摊明细表 | 每个参与人对某笔账单应承担的金额 |
| `audit_logs`        | 审计日志表 | 登录及重要数据变更的追踪记录     |

### `users` 用户表

| 字段            | 类型           | 约束                     | 说明                     |
| --------------- | -------------- | ------------------------ | ------------------------ |
| `id`            | `INT UNSIGNED` | PK, AUTO_INCREMENT       | 用户 ID                  |
| `username`      | `VARCHAR(50)`  | NOT NULL, UNIQUE         | 登录名，不区分大小写     |
| `password_hash` | `VARCHAR(255)` | NOT NULL                 | Argon2 密码哈希          |
| `nickname`      | `VARCHAR(50)`  | NULL                     | 展示昵称                 |
| `role`          | `VARCHAR(20)`  | NOT NULL, DEFAULT `user` | `admin` 或 `user`        |
| `is_active`     | `BOOLEAN`      | NOT NULL, DEFAULT TRUE   | 是否允许登录及参与新账单 |
| `created_at`    | `DATETIME(6)`  | NOT NULL                 | 创建时间                 |
| `updated_at`    | `DATETIME(6)`  | NOT NULL                 | 最后更新时间             |

### `categories` 分类表

| 字段         | 类型           | 约束                   | 说明               |
| ------------ | -------------- | ---------------------- | ------------------ |
| `id`         | `INT UNSIGNED` | PK, AUTO_INCREMENT     | 分类 ID            |
| `name`       | `VARCHAR(50)`  | NOT NULL, UNIQUE       | 分类名称           |
| `icon`       | `VARCHAR(50)`  | NULL                   | Emoji 或前端图标键 |
| `sort_order` | `INT`          | NOT NULL, DEFAULT 0    | 越小越靠前         |
| `is_active`  | `BOOLEAN`      | NOT NULL, DEFAULT TRUE | 是否可用于新账单   |
| `created_at` | `DATETIME(6)`  | NOT NULL               | 创建时间           |
| `updated_at` | `DATETIME(6)`  | NOT NULL               | 最后更新时间       |

### `bills` 账单表

| 字段          | 类型            | 约束               | 说明         |
| ------------- | --------------- | ------------------ | ------------ |
| `id`          | `INT UNSIGNED`  | PK, AUTO_INCREMENT | 账单 ID      |
| `title`       | `VARCHAR(100)`  | NOT NULL           | 账单标题     |
| `amount`      | `DECIMAL(10,2)` | NOT NULL, `> 0`    | 账单总金额   |
| `payer_id`    | `INT UNSIGNED`  | FK, NOT NULL       | 实际付款人   |
| `bill_date`   | `DATE`          | NOT NULL           | 实际消费日期 |
| `category_id` | `INT UNSIGNED`  | FK, NOT NULL       | 分类         |
| `note`        | `TEXT`          | NULL               | 备注         |
| `created_by`  | `INT UNSIGNED`  | FK, NOT NULL       | 录入人       |
| `created_at`  | `DATETIME(6)`   | NOT NULL           | 创建时间     |
| `updated_at`  | `DATETIME(6)`   | NOT NULL           | 最后更新时间 |

### `bill_participants` 分摊明细表

| 字段           | 类型            | 约束               | 说明        |
| -------------- | --------------- | ------------------ | ----------- |
| `id`           | `INT UNSIGNED`  | PK, AUTO_INCREMENT | 分摊记录 ID |
| `bill_id`      | `INT UNSIGNED`  | FK, NOT NULL       | 所属账单    |
| `user_id`      | `INT UNSIGNED`  | FK, NOT NULL       | 参与用户    |
| `share_amount` | `DECIMAL(10,2)` | NOT NULL, `>= 0`   | 应承担金额  |

### `audit_logs` 审计日志表

| 字段            | 类型              | 约束               | 说明                          |
| --------------- | ----------------- | ------------------ | ----------------------------- |
| `id`            | `BIGINT UNSIGNED` | PK, AUTO_INCREMENT | 日志 ID                       |
| `user_id`       | `INT UNSIGNED`    | FK, NULL           | 操作用户；匿名失败登录可为空  |
| `action`        | `VARCHAR(50)`     | NOT NULL           | 稳定的动作代码                |
| `resource_type` | `VARCHAR(50)`     | NULL               | `user`、`bill`、`category` 等 |
| `resource_id`   | `INT UNSIGNED`    | NULL               | 被操作资源 ID                 |
| `ip`            | `VARCHAR(45)`     | NULL               | IPv4 或 IPv6                  |
| `user_agent`    | `VARCHAR(255)`    | NULL               | 客户端信息                    |
| `detail`        | `JSON`            | NULL               | 不含敏感信息的变更摘要        |
| `created_at`    | `DATETIME(6)`     | NOT NULL           | 发生时间                      |
