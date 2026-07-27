# LuckyWallet 数据库脚本

本目录包含本地开发数据库的初始化脚本和模拟账单数据。

## 脚本说明

| 文件 | 用途 |
| --- | --- |
| `001_init_luckywallet.sql` | 创建 `luckywallet_dev` 数据库、数据表和默认账单分类 |
| `002_seed_demo_bills.sql` | 为前 5 名启用用户生成 100 笔模拟账单及分摊明细 |

模拟账单的消费日期覆盖 `2026-05-01` 至 `2026-07-27`，适合检查总览、
账单筛选、成员余额和统计图表。

## 1. 初始化数据库

在项目根目录执行：

```bash
mysql -u root -p < sql/001_init_luckywallet.sql
```

脚本会创建并使用 `luckywallet_dev` 数据库。

## 2. 准备 5 名成员

模拟数据脚本会按照用户 ID，从所有启用用户中选择前 5 名作为共同成员。
运行脚本前，确认数据库中至少存在 5 名启用用户：

```sql
USE luckywallet_dev;

SELECT id, username, nickname, is_active
FROM users
WHERE is_active = TRUE
ORDER BY id
LIMIT 5;
```

如果不足 5 名，请先通过后端管理脚本或数据库管理工具创建成员。用户必须：

- `is_active = TRUE`
- 使用有效的 Argon2 密码哈希
- `role` 为 `admin` 或 `user`

不要把明文密码直接写入 `password_hash`。

## 3. 导入模拟账单

```bash
mysql -u root -p luckywallet_dev < sql/002_seed_demo_bills.sql
```

成功后，终端最后会显示两组检查结果：

- `demo_bill_count` 应为 `100`
- `first_bill_date` 应为 `2026-05-01`
- `last_bill_date` 应为 `2026-07-27`
- `bills_with_invalid_shares` 应为 `0`

也可以手动检查：

```sql
SELECT COUNT(*), MIN(bill_date), MAX(bill_date)
FROM bills
WHERE note LIKE '[demo-seed-2026]%';
```

## 重复执行

`002_seed_demo_bills.sql` 可以重复执行。每次运行时，它只会删除备注以
`[demo-seed-2026]` 开头的旧模拟账单，然后重新生成 100 笔数据。

用户自己创建的账单不会被删除。

## 清理模拟数据

如果只想删除模拟账单：

```sql
USE luckywallet_dev;

DELETE FROM bills
WHERE note LIKE '[demo-seed-2026]%';
```

对应的 `bill_participants` 分摊明细会通过外键的 `ON DELETE CASCADE`
自动删除。

## 常见问题

### 提示需要 5 名启用用户

检查 `users` 表中是否至少有 5 条 `is_active = TRUE` 的记录。

### 提示需要 6 个启用分类

重新运行 `001_init_luckywallet.sql`，并确认默认分类没有被停用：

```sql
SELECT id, name, is_active
FROM categories
ORDER BY sort_order, id;
```

### 页面没有显示新数据

确认 MySQL 和 FastAPI 后端都已启动，并重新登录或刷新页面。前端通过
`GET /api/v1/bills` 读取数据库账单，不再读取浏览器 `localStorage`。
