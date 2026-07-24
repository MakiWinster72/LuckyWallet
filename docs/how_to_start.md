## 启动前端

在 frontend 文件夹使用

```bash
cd frontend

npm install

npm run dev
```

这里终端会提示在哪里访问页面，一般是 <http://localhost:5173>

> 修改颜色的话到这一步就可以了

## 启动后端

我们这里用uv来管理python项目，所以需要安装uv

```pwsh
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

```bash
cd backend

uv sync

uv run uvicorn app.main:app --reload --port 8000
```
