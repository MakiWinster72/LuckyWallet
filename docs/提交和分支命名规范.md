### 分支类型

| 类型       | 用途                 | 示例                    |
| ---------- | -------------------- | ----------------------- |
| `feat`     | 开发新功能           | `feat/login-page`       |
| `fix`      | 修复缺陷             | `fix/login-redirect`    |
| `refactor` | 重构但不改变功能     | `refactor/auth-service` |
| `docs`     | 只修改文档           | `docs/git-conventions`  |
| `test`     | 增加或修改测试       | `test/auth-api`         |
| `chore`    | 工具、依赖或工程配置 | `chore/eslint-config`   |
| `style`    | 只调整视觉或代码格式 | `style/material-login`  |
| `hotfix`   | 修复生产环境紧急问题 | `hotfix/login-crash`    |

### 命名要求

- 使用小写英文。
- 单词之间使用短横线 `-`。
- 一个分支只处理一个明确任务。

推荐：

```text
feat/login-page
feat/bill-statistics
fix/password-validation
docs/api-auth
```

不推荐：

```text
maki-branch
dev-1
test
new_feature
修改登录
```

## Commit Message

示例：

```text
feat(auth): add JWT login endpoint
fix(login): correct bearer authorization header
style(login): apply Material Design layout
docs: add Git conventions
chore(frontend): add react-router-dom
```

## 4. Commit 类型

| 类型       | 说明                             |
| ---------- | -------------------------------- |
| `feat`     | 新增用户可见的功能               |
| `fix`      | 修复错误                         |
| `docs`     | 只修改文档                       |
| `style`    | UI 视觉或不影响逻辑的格式调整    |
| `refactor` | 重构代码，不新增功能、不修复缺陷 |
| `test`     | 增加或修改测试                   |
| `chore`    | 依赖、脚本、配置等维护工作       |
| `perf`     | 性能优化                         |
| `build`    | 构建系统或依赖构建相关修改       |
| `ci`       | CI/CD 配置修改                   |
| `revert`   | 撤销以前的提交                   |

注意区分：

- 新增登录页面：`feat`
- 修改登录页面颜色和布局：`style`
- 修复登录按钮无响应：`fix`
- 拆分 AuthContext 文件但行为不变：`refactor`
- 安装 ESLint 或 React Router：`chore`
