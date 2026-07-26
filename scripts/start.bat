@echo off
chcp 65001 >nul
title LuckyWallet Launcher

set ROOT=%~dp0..

echo.
echo ╔══════════════════════════════════════╗
echo ║     LuckyWallet 开发环境检查        ║
echo ╚══════════════════════════════════════╝
echo.

REM ── 1. MySQL ──────────────────────────────────────────────────────
echo [→] 检查 MySQL……
where mysqladmin >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  mysqladmin ping -u%DB_USER% -p%DB_PASSWORD% -h127.0.0.1 --silent >nul 2>&1
  if %ERRORLEVEL% EQU 0 (
    echo   [✓] MySQL 连接正常
  ) else (
    echo   [✗] MySQL 连接失败
    echo       请确认 MySQL 已启动: net start MySQL
    pause
    exit /b 1
  )
) else (
  REM 用 sc 检查 MySQL 服务状态
  sc query MySQL80 >nul 2>&1
  if %ERRORLEVEL% EQU 0 (
    echo   [✓] MySQL 服务已安装
  ) else (
    sc query MySQL >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
      echo   [✓] MySQL 服务已安装
    ) else (
      echo   [⚠] 未找到 mysqladmin，请确认 MySQL 已安装并启动
    )
  )
)

REM ── 2. uv ─────────────────────────────────────────────────────────
echo [→] 检查 uv……
where uv >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  for /f "tokens=*" %%i in ('uv --version 2^>nul') do echo   [✓] uv %%i
) else (
  echo   [✗] uv 未安装
  echo       请执行: powershell -ExecutionMethod RemoteSigned -c "irm https://astral.sh/uv/install.ps1 | iex"
  pause
  exit /b 1
)

REM ── 3. Node.js ────────────────────────────────────────────────────
echo [→] 检查 Node.js……
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  for /f "tokens=*" %%i in ('node --version 2^>nul') do echo   [✓] Node.js %%i
) else (
  echo   [✗] Node.js 未安装
  echo       请访问 https://nodejs.org 下载安装
  pause
  exit /b 1
)

REM ── 4. 后端依赖 ────────────────────────────────────────────────────
echo [→] 检查后端依赖……
if exist "%ROOT%\backend\.venv" (
  echo   [✓] Python 虚拟环境已存在
  "%ROOT%\backend\.venv\Scripts\python" -c "import fastapi" >nul 2>&1
  if %ERRORLEVEL% EQU 0 (
    echo   [✓] 后端依赖已安装
  ) else (
    echo   [⚠] 依赖不完整，执行 uv sync……
    cd /d "%ROOT%\backend"
    call uv sync
    echo   [✓] 后端依赖已安装
  )
) else (
  echo   [→] 创建虚拟环境并安装依赖……
  cd /d "%ROOT%\backend"
  call uv sync
  echo   [✓] 后端依赖已安装
)

REM ── 5. 前端依赖 ────────────────────────────────────────────────────
echo [→] 检查前端依赖……
if exist "%ROOT%\frontend\node_modules" (
  echo   [✓] 前端依赖已安装
) else (
  echo   [→] 安装前端依赖……
  cd /d "%ROOT%\frontend"
  call npm install
  echo   [✓] 前端依赖已安装
)

REM ── 6. 启动 ─────────────────────────────────────────────────────────
echo.
echo ╔══════════════════════════════════════╗
echo ║     所有检查通过，启动服务          ║
echo ╚══════════════════════════════════════╝
echo.

REM 启动后端
echo [→] 启动后端 (FastAPI)……
cd /d "%ROOT%\backend"
start "LuckyWallet Backend" /B uv run uvicorn app.main:app --reload --port 8000
if %ERRORLEVEL% EQU 0 (
  echo   [✓] 后端已启动 → http://127.0.0.1:8000
) else (
  echo   [✗] 后端启动失败
)

REM 启动前端
echo [→] 启动前端 (Vite)……
cd /d "%ROOT%\frontend"
start "LuckyWallet Frontend" /B cmd /c "npm run dev"
if %ERRORLEVEL% EQU 0 (
  echo   [✓] 前端已启动 → http://localhost:5173
) else (
  echo   [✗] 前端启动失败
)

echo.
echo ========================================
echo   LuckyWallet 已启动！
echo   前端: http://localhost:5173
echo   后端: http://127.0.0.1:8000
echo   API:  http://127.0.0.1:8000/docs
echo ========================================
echo.
pause
