#!/usr/bin/env bash
set -e

# ──────────────────────────────────────────────────────────────────────
# LuckyWallet 一键启动脚本 (Linux / macOS)
# ──────────────────────────────────────────────────────────────────────

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; exit 1; }
info() { echo -e "  ${CYAN}→${NC} $1"; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     LuckyWallet 开发环境检查        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── 加载 .env ────────────────────────────────────────────────────────
if [ -f "$ROOT/.env" ]; then
  set -a; source "$ROOT/.env"; set +a
  ok "已加载 .env 文件"
else
  warn "未找到 .env 文件，使用默认值"
fi

# ── 1. MySQL ─────────────────────────────────────────────────────────
info "检查 MySQL……"

MYSQL_USER="${DB_USER:-luckywallet}"
MYSQL_PASS="${DB_PASSWORD:-luckywallet}"
MYSQL_HOST="${DB_HOST:-127.0.0.1}"
MYSQL_PORT="${DB_PORT:-3306}"

# 检查 MySQL 进程
if command -v pgrep &>/dev/null && pgrep -x mysqld &>/dev/null; then
  ok "MySQL 进程运行中"
elif command -v mysqladmin &>/dev/null && mysqladmin ping -u"$MYSQL_USER" -p"$MYSQL_PASS" -h"$MYSQL_HOST" -P"$MYSQL_PORT" --silent 2>/dev/null; then
  ok "MySQL 进程运行中"
else
  # 尝试启动 MySQL（常见发行版）
  if command -v systemctl &>/dev/null; then
    warn "MySQL 未运行，尝试启动……"
    sudo systemctl start mysql 2>/dev/null || sudo systemctl start mariadb 2>/dev/null || true
    sleep 2
  elif command -v mysqld_safe &>/dev/null; then
    warn "MySQL 未运行，尝试启动……"
    mysqld_safe --user=mysql &
    sleep 3
  fi

  if command -v mysqladmin &>/dev/null && mysqladmin ping -u"$MYSQL_USER" -p"$MYSQL_PASS" -h"$MYSQL_HOST" -P"$MYSQL_PORT" --silent 2>/dev/null; then
    ok "MySQL 已启动"
  else
    fail "无法连接 MySQL，请确认 MySQL 已启动且 .env 配置正确"
  fi
fi

# 检查连接
if command -v mysqladmin &>/dev/null; then
  if mysqladmin ping -u"$MYSQL_USER" -p"$MYSQL_PASS" -h"$MYSQL_HOST" -P"$MYSQL_PORT" --silent 2>/dev/null; then
    ok "MySQL 连接正常"
  else
    fail "MySQL 连接失败（${MYSQL_USER}@${MYSQL_HOST}:${MYSQL_PORT}）"
  fi
else
  warn "未安装 mysqladmin，跳过连接验证"
fi

# ── 2. uv ────────────────────────────────────────────────────────────
info "检查 Python 工具链……"
if command -v uv &>/dev/null; then
  ok "uv $(uv --version 2>/dev/null | head -1)"
else
  fail "uv 未安装，请执行: curl -LsSf https://astral.sh/uv/install.sh | sh"
fi

# ── 3. Node.js ──────────────────────────────────────────────────────
info "检查 Node.js……"
if command -v node &>/dev/null; then
  ok "Node.js $(node --version)"
else
  fail "Node.js 未安装，请访问 https://nodejs.org 下载安装"
fi

# ── 4. 后端依赖 ─────────────────────────────────────────────────────
info "检查后端依赖……"
if [ -d "$ROOT/backend/.venv" ]; then
  ok "Python 虚拟环境已存在"
  # 检查关键依赖是否安装（快速验证）
  if "$ROOT/backend/.venv/bin/python" -c "import fastapi" 2>/dev/null; then
    ok "后端依赖已安装"
  else
    warn "依赖不完整，执行 uv sync……"
    cd "$ROOT/backend" && uv sync
    ok "后端依赖已安装"
  fi
else
  info "创建虚拟环境并安装依赖……"
  cd "$ROOT/backend" && uv sync
  ok "后端依赖已安装"
fi

# ── 5. 前端依赖 ─────────────────────────────────────────────────────
info "检查前端依赖……"
if [ -d "$ROOT/frontend/node_modules" ]; then
  ok "前端依赖已安装"
else
  info "安装前端依赖……"
  cd "$ROOT/frontend" && npm install
  ok "前端依赖已安装"
fi

# ── 6. 启动 ──────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     所有检查通过，启动服务          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

# 终端关闭时杀掉后台进程
cleanup() {
  echo ""; info "关闭服务……"
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

# 启动后端
info "启动后端 (FastAPI)……"
cd "$ROOT/backend"
uv run uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
sleep 2
if kill -0 "$BACKEND_PID" 2>/dev/null; then
  ok "后端已启动 → http://127.0.0.1:8000"
else
  fail "后端启动失败"
fi

# 启动前端
info "启动前端 (Vite)……"
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
sleep 3
if kill -0 "$FRONTEND_PID" 2>/dev/null; then
  ok "前端已启动 → http://localhost:5173"
else
  fail "前端启动失败"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  LuckyWallet 已启动！${NC}"
echo -e "${GREEN}  前端: http://localhost:5173${NC}"
echo -e "${GREEN}  后端: http://127.0.0.1:8000${NC}"
echo -e "${GREEN}  API:  http://127.0.0.1:8000/docs${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
info "按 Ctrl+C 停止所有服务"

wait
