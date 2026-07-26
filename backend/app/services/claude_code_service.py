import asyncio
import shutil
from pathlib import Path
from typing import AsyncIterator

_PROJECT_ROOT = Path(__file__).resolve().parents[3]


class ClaudeCodeError(Exception):
    pass


class ClaudeCodeSession:
    """每条消息独立调用 ``claude --print``，但通过维护对话历史来保持同一个会话上下文。

    为什么不搞持久进程?
    - 兼容非官方模型（不需要 PTY/TTY）
    - 可靠，没有 ANSI 剥离/静默检测问题
    - 每条消息都跑 ``claude --print --permission-mode <mode> -p <含历史的 prompt>``
    - 后端自动拼接历史，claude 看到完整的上下文
    """

    def __init__(self, user_id: int, is_admin: bool) -> None:
        self.user_id = user_id
        self._permission_mode = "auto" if is_admin else "plan"
        self._claude_path: str | None = None
        self._history: list[dict[str, str]] = []
        self._resolve_claude()

    # ── public API ────────────────────────────────────────────────

    async def send_message(self, text: str) -> AsyncIterator[str]:
        """调用 ``claude --print`` 并逐行 yield 响应。"""
        self._history.append({"role": "user", "content": text})

        prompt = self._build_prompt()
        cmd = [
            self._claude_path,
            "--print",
            "--permission-mode", self._permission_mode,
            "-p", prompt,
        ]

        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(_PROJECT_ROOT),
            )
        except FileNotFoundError as exc:
            raise ClaudeCodeError(f"无法启动 claude：{exc}") from exc

        assert proc.stdout is not None
        response_parts: list[str] = []

        while True:
            line = await proc.stdout.readline()
            if not line:
                break
            chunk = line.decode("utf-8", errors="replace").rstrip("\n")
            if chunk:
                response_parts.append(chunk)
                yield chunk

        await proc.wait()
        if proc.returncode != 0 and not response_parts:
            stderr = (await proc.stderr.read()).decode("utf-8", errors="replace") if proc.stderr else ""
            detail = stderr[:500] if stderr.strip() else f"exit code {proc.returncode}"
            raise ClaudeCodeError(f"claude 异常退出: {detail}")

        self._history.append({"role": "assistant", "content": "\n".join(response_parts)})

    def close(self) -> None:
        pass

    # ── internals ─────────────────────────────────────────────────

    def _resolve_claude(self) -> None:
        path = shutil.which("claude")
        if not path:
            nvm_glob = sorted(
                Path.home().joinpath(".nvm/versions/node").glob("*/bin/claude")
            )
            if nvm_glob:
                path = str(nvm_glob[-1])
        if not path:
            raise ClaudeCodeError(
                "未在系统中找到 `claude` 命令。请确认已安装 Claude Code。"
            )
        self._claude_path = path

    def _build_prompt(self) -> str:
        """把全部历史拼接成一段文本来维持会话上下文。"""
        lines: list[str] = []
        for entry in self._history[:-1]:
            role = "Human" if entry["role"] == "user" else "Assistant"
            lines.append(f"{role}: {entry['content']}")
        latest = self._history[-1]
        lines.append(f"Human: {latest['content']}")
        lines.append("Assistant:")
        return "\n\n".join(lines)
