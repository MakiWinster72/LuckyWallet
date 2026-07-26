import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Marked } from "marked";
import { useAuth } from "../auth/useAuth";
import { AppIcon } from "./AppIcon";

const marked = new Marked({
  breaks: true,
  gfm: true,
});

const TOKEN_KEY = "luckywallet_access_token";
const STORAGE_KEY = "lw_claude_chat_history";

function wsUrl(token) {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/api/v1/ws/claude?token=${token}`;
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(msgs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch { /* ignore quota errors */ }
}

export function ClaudeCodeChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => loadHistory());
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const wsRef = useRef(null);
  const listRef = useRef(null);
  const restoredRef = useRef(false);

  // ── WebSocket lifecycle ────────────────────────────────────────

  const connect = useCallback(() => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const ws = new WebSocket(wsUrl(token));
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      // Restore previous conversation history on the backend
      const saved = loadHistory();
      const conversations = saved.filter((m) => m.role === "user" || m.role === "assistant");
      if (conversations.length > 0) {
        ws.send(JSON.stringify({ type: "restore", history: conversations }));
        restoredRef.current = true;
      }
      setMessages((prev) => [...prev, { role: "system", text: restoredRef.current ? "会话已恢复" : "已连接到 Claude Code" }]);
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (data.type) {
        case "status":
          setStatus(data.content);
          setMessages((prev) => {
            const last = prev.at(-1);
            if (last?.role === "system" && last.text === "已连接到 Claude Code") {
              const updated = [...prev];
              updated[updated.length - 1] = { ...last, text: data.content };
              return updated;
            }
            return [...prev, { role: "system", text: data.content }];
          });
          break;

        case "chunk":
          setMessages((prev) => {
            const clone = [...prev];
            const last = clone.at(-1);
            if (last?.role === "assistant") {
              clone[clone.length - 1] = { ...last, text: last.text + data.content + "\n" };
            } else {
              clone.push({ role: "assistant", text: data.content + "\n" });
            }
            return clone;
          });
          break;

        case "done":
          setBusy(false);
          break;

        case "error":
          setMessages((prev) => [...prev, { role: "system", text: "❌ " + data.content }]);
          setBusy(false);
          break;
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (!open) return; // don't spam if user closed manually
      setMessages((prev) => [...prev, { role: "system", text: "⚠️ 连接断开（5 秒后重试）" }]);
      // auto reconnect
      setTimeout(() => {
        if (open) connect();
      }, 5000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [open]);

  useEffect(() => {
    if (open && !wsRef.current) {
      connect();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // silence the reconnect logic
        wsRef.current.close();
        wsRef.current = null;
        setConnected(false);
      }
    };
  }, [open, connect]);

  // ── persist messages ──────────────────────────────────────────

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  // ── send ───────────────────────────────────────────────────────

  function send(text) {
    if (!text.trim() || busy || !wsRef.current) return;
    setMessages((prev) => [...prev, { role: "user", text: text.trim() }]);
    setInput("");
    setBusy(true);
    wsRef.current.send(JSON.stringify({ type: "message", content: text.trim() }));
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(input);
    }
  }

  // ── markdown helper ────────────────────────────────────────────

  function renderMarkdown(text) {
    const html = marked.parse(text, { async: false });
    return { __html: html };
  }

  // ── auto scroll ────────────────────────────────────────────────

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // ── render ─────────────────────────────────────────────────────

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const modeLabel = isAdmin ? "auto (yolo)" : "plan (只读)";
  const permissionMode = isAdmin ? "auto" : "plan";

  return (
    <>
      {/* ── floating button ──────────────────────────────────── */}
      <button
        className="cc-fab"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Claude Code 助手"
        title="Claude Code 助手"
      >
        <ClaudeCodeIcon />
      </button>

      {/* ── chat dialog ──────────────────────────────────────── */}
      {open ? (
        <aside className="cc-dialog" role="dialog" aria-modal="true" aria-label="Claude Code 聊天">
          {/* header */}
          <header className="cc-header">
            <ClaudeCodeIcon />
            <div>
              <strong>Claude Code</strong>
              <small>
                <span className={`cc-badge ${isAdmin ? "is-yolo" : "is-plan"}`}>
                  {modeLabel}
                </span>
                {connected ? (
                  <span className="cc-dot cc-dot-on" aria-label="已连接" />
                ) : (
                  <span className="cc-dot cc-dot-off" aria-label="未连接" />
                )}
              </small>
            </div>
            <button
              className="cc-close"
              type="button"
              onClick={() => { setOpen(false); setMessages([]); setStatus(""); setBusy(false); }}
              aria-label="关闭"
            >
              <AppIcon name="close" size={16} />
            </button>
          </header>

          {/* messages */}
          <div className="cc-list" ref={listRef}>
            {messages.length === 0 ? (
              <div className="cc-empty">
                <ClaudeCodeIcon />
                <p>
                  {isAdmin
                    ? "权限模式：auto（自动批准所有操作）"
                    : "权限模式：plan（只生成方案，不执行命令）"}
                </p>
                <p>试试提问：这个项目的架构是怎样的？</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`cc-msg cc-msg-${msg.role}`}>
                  {msg.role === "assistant" ? <ClaudeCodeIcon /> : null}
                  {msg.role === "user" ? <div className="cc-user-label">{user.nickname ?? user.username}</div> : null}
                  {msg.role === "assistant"
                    ? <div className="cc-bubble cc-md" dangerouslySetInnerHTML={renderMarkdown(msg.text)} />
                    : <div className="cc-bubble">{msg.text}</div>}
                </div>
              ))
            )}
            {busy && messages.length > 0 && messages.at(-1)?.role !== "assistant" ? (
              <div className="cc-msg cc-msg-assistant">
                <ClaudeCodeIcon />
                <div className="cc-bubble cc-thinking">
                  <span className="cc-dot-pulse"><span /></span>
                  思考中
                </div>
              </div>
            ) : null}
          </div>

          {/* input */}
          <div className="cc-footer">
            <textarea
              className="cc-input"
              rows={1}
              placeholder="给 Claude Code 发消息…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={busy || !connected}
            />
            <button
              className="cc-send"
              type="button"
              disabled={!input.trim() || busy || !connected}
              onClick={() => send(input)}
              aria-label="发送"
            >
              <AppIcon name="arrow" size={16} />
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}

function ClaudeCodeIcon() {
  return (
    <svg
      className="cc-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      aria-hidden="true"
    >
      <path
        clipRule="evenodd"
        d="M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0V10.95h3V5h17.998v5.949zM6 10.949h1.488V8.102H6v2.847zm10.51 0H18V8.102h-1.49v2.847z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
