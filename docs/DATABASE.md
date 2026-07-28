# 数据库说明

## 初始化

```bash
mysql -u root -p < sql/001_init_luckywallet.sql
```

脚本会创建 `luckywallet_dev` 数据库、6 张业务表和 6 个默认分类。演示用户与演示账单的导入方式见[快速启动](/how_to_start#_1-初始化数据库)。

## 表一览

| 表名                 | 用途                                 |
| -------------------- | ------------------------------------ |
| `users`              | 登录账号、昵称、头像、角色和启用状态 |
| `household_settings` | 全团队共享的月度预算                 |
| `categories`         | 账单分类及展示顺序                   |
| `bills`              | 共同消费的金额、付款人、日期和分类   |
| `bill_participants`  | 每位参与人对每笔账单的应承担金额     |
| `audit_logs`         | 登录及重要数据变更的追踪记录         |

## `users`

| 字段            | 类型           | 约束                   | 说明                                  |
| --------------- | -------------- | ---------------------- | ------------------------------------- |
| `id`            | `INT UNSIGNED` | PK, AUTO_INCREMENT     | 用户 ID                               |
| `username`      | `VARCHAR(50)`  | NOT NULL, UNIQUE       | 登录名，使用不区分大小写的排序规则    |
| `password_hash` | `VARCHAR(255)` | NOT NULL               | Argon2 密码哈希                       |
| `nickname`      | `VARCHAR(50)`  | NULL                   | 展示昵称                              |
| `avatar_url`    | `VARCHAR(255)` | NULL                   | 头像访问路径，文件本身位于 `uploads/` |
| `role`          | `VARCHAR(20)`  | `admin` 或 `user`      | 权限角色                              |
| `is_active`     | `BOOLEAN`      | NOT NULL, DEFAULT TRUE | 是否允许登录及参与新账单              |
| `created_at`    | `DATETIME(6)`  | NOT NULL               | 创建时间                              |
| `updated_at`    | `DATETIME(6)`  | NOT NULL               | 最后更新时间                          |

> 停用用户不会删除历史账单，只会阻止其登录以及被选入新账单。

## `household_settings`

| 字段             | 类型            | 约束            | 说明                                 |
| ---------------- | --------------- | --------------- | ------------------------------------ |
| `id`             | `INT`           | PK              | 固定配置记录 ID                      |
| `monthly_budget` | `DECIMAL(10,2)` | NOT NULL, `> 0` | 全团队共享的月度预算，默认 `2400.00` |

## `categories`

| 字段         | 类型           | 约束                   | 说明             |
| ------------ | -------------- | ---------------------- | ---------------- |
| `id`         | `INT UNSIGNED` | PK, AUTO_INCREMENT     | 分类 ID          |
| `name`       | `VARCHAR(50)`  | NOT NULL, UNIQUE       | 分类名称         |
| `icon`       | `VARCHAR(50)`  | NULL                   | 前端图标键       |
| `sort_order` | `INT`          | NOT NULL, DEFAULT 0    | 数值越小越靠前   |
| `is_active`  | `BOOLEAN`      | NOT NULL, DEFAULT TRUE | 是否可用于新账单 |
| `created_at` | `DATETIME(6)`  | NOT NULL               | 创建时间         |
| `updated_at` | `DATETIME(6)`  | NOT NULL               | 最后更新时间     |

> 初始化脚本写入餐饮、零食、日用品、聚会、交通和其他 6 个分类。

## `bills`

| 字段          | 类型            | 约束               | 说明                           |
| ------------- | --------------- | ------------------ | ------------------------------ |
| `id`          | `INT UNSIGNED`  | PK, AUTO_INCREMENT | 账单 ID                        |
| `title`       | `VARCHAR(100)`  | NOT NULL           | 账单标题                       |
| `amount`      | `DECIMAL(10,2)` | NOT NULL, `> 0`    | 账单总金额                     |
| `payer_id`    | `INT UNSIGNED`  | FK, NOT NULL       | 实际付款人                     |
| `bill_date`   | `DATE`          | NOT NULL           | 实际消费日期，也是统计归属日期 |
| `category_id` | `INT UNSIGNED`  | FK, NOT NULL       | 分类                           |
| `note`        | `TEXT`          | NULL               | 最长 2000 字符                 |
| `created_by`  | `INT UNSIGNED`  | FK, NOT NULL       | 录入用户                       |
| `created_at`  | `DATETIME(6)`   | NOT NULL           | 创建时间                       |
| `updated_at`  | `DATETIME(6)`   | NOT NULL           | 最后更新时间                   |

> `bill_date + category_id`、付款人、录入人和创建时间均建立了查询索引。

## `bill_participants`

| 字段           | 类型            | 约束               | 说明             |
| -------------- | --------------- | ------------------ | ---------------- |
| `id`           | `INT UNSIGNED`  | PK, AUTO_INCREMENT | 分摊记录 ID      |
| `bill_id`      | `INT UNSIGNED`  | FK, NOT NULL       | 所属账单         |
| `user_id`      | `INT UNSIGNED`  | FK, NOT NULL       | 参与用户         |
| `share_amount` | `DECIMAL(10,2)` | NOT NULL, `>= 0`   | 该用户应承担金额 |

`(bill_id, user_id)` 有唯一约束。业务层保证同一账单的全部 `share_amount` 之和等于 `bills.amount`，数据库本身无法通过单行 CHECK 表达这一跨行规则。

## `audit_logs`

| 字段            | 类型              | 约束               | 说明                             |
| --------------- | ----------------- | ------------------ | -------------------------------- |
| `id`            | `BIGINT UNSIGNED` | PK, AUTO_INCREMENT | 日志 ID                          |
| `user_id`       | `INT UNSIGNED`    | FK, NULL           | 操作用户；匿名失败登录可为空     |
| `action`        | `VARCHAR(50)`     | NOT NULL           | 稳定动作代码，如 `login_success` |
| `resource_type` | `VARCHAR(50)`     | NULL               | 资源类型                         |
| `resource_id`   | `INT UNSIGNED`    | NULL               | 资源 ID                          |
| `ip`            | `VARCHAR(45)`     | NULL               | IPv4 或 IPv6                     |
| `user_agent`    | `VARCHAR(255)`    | NULL               | 客户端信息                       |
| `detail`        | `JSON`            | NULL               | 不含敏感信息的操作摘要           |
| `created_at`    | `DATETIME(6)`     | NOT NULL           | 发生时间                         |
