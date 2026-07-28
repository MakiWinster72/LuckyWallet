# 项目实现细节

本文介绍 LuckyWallet 为什么要做、如何实现，以及开发者如何继续维护和扩展项目。

## 一、项目背景与市场需求

团队临时集资是非常常见的协作场景：聚餐、团建、短途旅行、社团活动、项目采购、合租公共支出，都可能需要多人先后垫付，再由所有参与者共同承担。

传统做法通常依赖聊天记录、表格或人工记忆，容易出现几个问题：

- 付款人和实际承担人混淆，事后很难还原每笔钱的去向；
- 成员临时加入或退出后，原有分摊需要重新计算；
- 零钱尾差靠人工处理，最后总额可能对不上；
- 多笔账单叠加后，很难判断谁应该收钱、谁应该补钱；
- 预算、统计和结算分散在不同工具中，团队缺少统一记录；
- 普通表格缺少账号权限、操作审计和安全的多人协作机制。

这些问题并不只存在于家庭场景，也存在于临时项目组、学生社团、活动组织者和小型团队中。LuckyWallet 的定位就是一个面向团队的共享钱包：记录付款人、参与成员和分摊结果，将“谁先付了”和“最后谁应该给谁”放在同一套系统中管理。

## 二、产品如何解决痛点

LuckyWallet 将一次共同支出拆成清晰的业务事实：

```text
一笔账单 = 谁付款 + 谁参与 + 总金额 + 消费日期 + 分类
                         │
                         ▼
                  每人应承担金额
                         │
                         ▼
                   成员最终净额
                         │
                         ▼
                    结算建议
```

系统自动完成平均分摊、分币尾差处理、成员净额计算、预算进度、统计分析和结算建议。团队成员只需要维护真实发生的账单，不必再手动维护复杂的平衡表。

## 三、技术栈选择

项目技术栈如下：

- Python：后端开发语言；
- FastAPI：后端 Web 框架和 API 服务；
- MySQL 8：业务数据存储；
- JWT：登录身份认证；
- React：前端界面开发；
- Vite：前端开发服务器和构建工具；
- Docker Compose：多服务容器编排；
- Nginx：静态文件服务和反向代理；
- VitePress：项目文档站点。

## 四、GitHub 协作与专项交流

GitHub 是项目的代码、Issue、讨论和变更记录中心。功能需求、Bug、设计决策和接口变更应尽量在 GitHub Issue 或 Discussion 中留下上下文，避免只在即时聊天中做出不可追踪的决定。

建议按以下方式组织专项交流：

- 产品需求：描述使用场景、目标用户、痛点和验收标准；
- 技术方案：说明数据模型、接口、权限、兼容性和替代方案；
- Bug 反馈：提供复现步骤、实际结果、预期结果、环境和日志；
- 发布检查：记录测试结果、数据库变更、部署影响和回滚方式。

提交信息和分支命名遵循[提交和分支命名规范](/collaboration/commit-conventions)。通常使用 `feat`、`fix`、`docs`、`style`、`refactor`、`test`、`chore` 等类型；一个提交应尽量只表达一个完整意图。涉及数据库、权限或金额规则的改动，应在 Pull Request 中明确说明影响范围并附测试结果。

## 五、项目结构与文件职责

```text
LuckyWallet/
├─ backend/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ deps.py                 # 数据库会话、当前用户、管理员依赖
│  │  │  └─ routes/
│  │  │     ├─ auth.py              # 登录、当前用户和头像上传
│  │  │     ├─ bills.py             # 账单增删改查
│  │  │     ├─ members.py           # 启用成员和成员财务汇总
│  │  │     ├─ statistics.py        # 月度统计接口
│  │  │     ├─ settings.py          # 团队预算
│  │  │     ├─ admin_users.py       # 管理员用户管理
│  │  │     └─ claude_code.py       # Claude Code WebSocket
│  │  ├─ core/security.py           # Argon2 和 JWT
│  │  ├─ models/                    # user、bill、audit_log 等 ORM 模型
│  │  ├─ repositories/              # 数据库读写和聚合查询
│  │  ├─ schemas/                   # API 请求、响应和字段校验
│  │  ├─ services/                  # 认证、账单、预算、成员、统计业务
│  │  ├─ config.py                  # 环境变量配置
│  │  ├─ database.py                # Engine、Session 和连接管理
│  │  ├─ runtime_schema.py          # 旧开发库兼容处理
│  │  └─ main.py                    # 创建 FastAPI 应用并注册中间件、路由
│  ├─ scripts/create_admin.py       # 创建首个管理员
│  └─ tests/                        # 后端单元测试
├─ frontend/
│  ├─ src/
│  │  ├─ api/                       # 请求函数、API 配置和响应 adapter
│  │  ├─ auth/                      # AuthContext、token 和 ProtectedRoute
│  │  ├─ components/                # 账单、成员、用户、结算和聊天组件
│  │  ├─ data/                     # 筛选、统计、分摊、预算和结算纯函数
│  │  ├─ pages/                    # LoginPage 和 DashboardPage
│  │  ├─ styles/colors.css          # 主题颜色变量
│  │  ├─ utils/money.js             # 金额解析、格式化和换算
│  │  ├─ App.jsx                    # 应用级页面组织
│  │  └─ index.css                  # 全局布局、组件和响应式样式
│  └─ index.html                    # Vite HTML 入口
├─ sql/
│  ├─ 001_init_luckywallet.sql      # 初始表结构、索引和分类
│  ├─ 002_seed_demo_users.sql       # 演示用户
│  ├─ 003_seed_demo_bills.sql       # 演示账单
│  └─ 004_reset_database.sql        # 本地演示数据重置
├─ docs/                            # VitePress 文档
├─ docker-compose.yml               # 生产/本地容器编排
└─ README.md                        # 项目入口
```

## 六、核心功能实现

### 1. 认证和权限

登录接口校验用户名、启用状态和 Argon2 密码哈希，成功后签发 JWT。每个受保护的接口通过依赖注入获得当前用户；需要管理员权限的路由再使用 `AdminUser` 依赖。

```python
@router.put("/settings/budget")
def update_budget(
    payload: BudgetUpdate,
    user: User = Depends(get_current_admin),
    service: BudgetService = Depends(get_budget_service),
):
    return service.update(payload.monthly_budget, user)
```

这种方式让权限检查集中在依赖层，业务服务不需要重复解析请求头，同时也便于测试普通用户和管理员的差异。

### 2. 账单分摊

创建账单时，Service 先验证付款人、参与人和分类均存在且处于启用状态，再使用 `Decimal` 计算每人的承担金额。基础份额向下保留到分，剩余分币按参与人顺序补齐，确保金额闭合。

```python
base = (amount / len(participant_ids)).quantize(
    Decimal("0.01"), rounding=ROUND_DOWN
)
remainder = int((amount - base * len(participant_ids)) * 100)
shares = [base + (Decimal("0.01") if i < remainder else Decimal("0"))
          for i in range(len(participant_ids))]
```

数据库使用 `bills` 和 `bill_participants` 两张表保存主记录与分摊明细，避免把成员列表或金额塞进不可查询的 JSON 字段。

### 3. 成员净额和结算

成员服务按账单聚合：付款人增加已垫付金额，参与人增加应承担金额，最后计算净额。前端的结算纯函数再将正负净额配对，生成尽量少的建议转账记录。

```text
已垫付 = 作为 payer 的账单金额之和
应承担 = 作为 participant 的 share_amount 之和
净额   = 已垫付 - 应承担
```

结算只是一种可解释的建议，不写回账单状态，也不伪造支付成功结果。

### 4. 统计与预算

统计按 `bill_date` 归属月份，而不是按创建时间归属。Repository 负责按日期、分类和付款人聚合，Schema 负责输出统一的金额字段，前端 `src/data` 再生成趋势图、分类占比和导出 CSV。

预算保存在团队共享的单行 `household_settings` 配置中。预算进度由共同支出除以月度预算得到，管理员可以修改，普通成员只能读取。

### 5. 文件上传和头像

头像接口使用 `multipart/form-data`，后端检查 MIME 类型、文件大小和空文件，再以随机文件名写入 `uploads/`。数据库只保存访问路径，不保存二进制内容；更新头像成功后清理旧文件。生产环境必须将 `uploads/` 放入持久化卷并限制访问权限。

## 七、Docker 支持

Docker Compose 将系统拆成三个服务：

```text
frontend (Nginx :80)
  ├─ 静态文件 → frontend/dist
  ├─ /api/     → backend:8000
  └─ /uploads/ → backend:8000

backend (Uvicorn :8000) → mysql:3306
mysql (MySQL 8)          → db-data volume
backend                  → uploads volume
```

启动流程：

1. 复制 `.env.docker` 为 `.env` 并替换数据库密码、JWT 密钥和前端来源；
2. 执行 `docker compose up -d --build`；
3. 查看 `docker compose logs -f backend` 确认后端正常；
4. 访问前端并使用管理员账号登录。

数据库和头像通过卷持久化。`docker compose down` 会停止服务但保留卷；`docker compose down -v` 会删除数据，只能用于明确的重置场景。

## 八、维护与扩展

### 日常维护

- 定期备份 MySQL 数据库和 `uploads/`；
- 检查容器日志、磁盘空间和头像目录增长；
- 定期轮换 JWT 密钥和数据库凭据；
- 生产环境停用演示账号，限制管理员数量；
- 升级依赖前先在测试环境运行完整测试和构建。

### 修改数据库

字段变更必须同步 SQLAlchemy Model、Pydantic Schema、Repository、初始化 SQL、测试、API 文档和数据库说明。生产数据库应使用经过评审的迁移脚本，不要直接执行破坏性重置脚本。

### 修改业务功能

建议顺序为：先写 Schema 和 Service 测试，再实现 Repository 和 Route，随后增加前端 API adapter、页面状态和文档。涉及金额、权限、删除和上传的改动必须覆盖成功、失败和边界路径。

### 验证命令

```bash
cd backend && uv run pytest
cd ../frontend && npm test && npm run lint && npm run build
cd ../docs && npm run docs:build
```

相关文档：[快速启动](/guides/how_to_start)、[使用手册](/guides/user-guide)、[API 接口文档](/reference/api)、[部署手册](/guides/deployment)。
