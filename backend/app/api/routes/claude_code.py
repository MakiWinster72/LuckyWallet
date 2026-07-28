import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

from app.core.security import decode_access_token
from app.models import User
from app.repositories.user_repository import UserRepository
from app.database import SessionLocal
from app.services.claude_code_service import ClaudeCodeError, ClaudeCodeSession

logger = logging.getLogger(__name__)

router = APIRouter(tags=["claude"])


async def _authenticate_ws(websocket: WebSocket) -> User | tuple[int, str]:
    """Validate the JWT token sent as a query parameter.

    Returns the User on success, or a (status_code, detail) tuple on failure.
    """
    token = websocket.query_params.get("token")
    if not token:
        return status.WS_1008_POLICY_VIOLATION, "缺少认证令牌"

    user_id = decode_access_token(token)
    if user_id is None:
        return status.WS_1008_POLICY_VIOLATION, "令牌无效或已过期"

    db = SessionLocal()
    try:
        user = UserRepository(db).get_by_id(user_id)
        if user is None or not user.is_active:
            return status.WS_1008_POLICY_VIOLATION, "用户不存在或已停用"
        return user
    finally:
        db.close()


@router.websocket("/ws/claude")
async def claude_chat(websocket: WebSocket) -> None:
    """WebSocket endpoint for the Claude Code chat dialog.

    **Auth** – pass ``?token=<JWT>`` as a query parameter on connect.
    **Protocol** – JSON text frames:

    * → ``{"type": "message", "content": "…"}``
    * ← ``{"type": "chunk",  "content": "…"}``   (streaming response)
    * ← ``{"type": "done"}``                     (response complete)
    * ← ``{"type": "error", "content": "…"}``    (error occurred)
    """
    await websocket.accept()

    # ── auth ──────────────────────────────────────────────────────
    auth_result = await _authenticate_ws(websocket)
    if isinstance(auth_result, tuple):
        code, detail = auth_result
        await websocket.send_json({"type": "error", "content": detail})
        await websocket.close(code=code)
        return

    user: User = auth_result
    is_admin = user.role == "admin"
    mode = "auto (yolo)" if is_admin else "plan (只读)"
    logger.info("Claude WS opened  user=%s  mode=%s", user.username, mode)

    # ── session ───────────────────────────────────────────────────
    session = ClaudeCodeSession(user_id=user.id, is_admin=is_admin)

    await websocket.send_json({
        "type": "status",
        "content": f"Claude Code 已就绪（{mode}）",
    })

    # ── message loop ──────────────────────────────────────────────
    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)

            if data.get("type") == "restore":
                history = data.get("history", [])
                for entry in history:
                    role = entry.get("role", "user")
                    content = entry.get("text", "")
                    if role in {"user", "assistant"} and isinstance(content, str) and content.strip():
                        session.restore_history.append({"role": role, "content": content})
                logger.info("Restored %d history entries for user=%s", len(history), user.username)
                continue

            if data.get("type") != "message":
                continue

            text = data.get("content", "").strip()
            if not text:
                continue

            try:
                async for chunk in session.send_message(text):
                    await websocket.send_json({"type": "chunk", "content": chunk})
                await websocket.send_json({"type": "done"})
            except ClaudeCodeError as exc:
                await websocket.send_json({"type": "error", "content": str(exc)})
            except Exception as exc:
                logger.exception("Unexpected error in Claude Code session")
                await websocket.send_json({
                    "type": "error",
                    "content": f"服务异常：{exc}",
                })

    except WebSocketDisconnect:
        logger.info("Claude WS closed  user=%s", user.username)
    except Exception:
        logger.exception("WebSocket handler error")
    finally:
        session.close()
