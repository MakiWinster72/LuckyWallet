import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { ApiError } from "../api/auth";
import { useAuth } from "../auth/useAuth";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError("请输入用户名和密码");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await login({ username: username.trim(), password });
      navigate(location.state?.from ?? "/dashboard", { replace: true });
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "无法连接服务器，请稍后重试",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-labelledby="login-title">
        <div className="login-intro">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">L</span>
            <span>LuckyWallet</span>
          </div>

          <div className="wallet-visual" aria-hidden="true">
            <span className="wallet-card wallet-card-back" />
            <span className="wallet-card wallet-card-middle" />
            <span className="wallet-card wallet-card-front">
              <span className="wallet-chip" />
              <span className="wallet-total">¥ 1,280.00</span>
              <span className="wallet-caption">本月共同支出</span>
            </span>
          </div>

          <div>
            <p className="eyebrow">共同消费，清楚分摊</p>
            <h1>每一笔集资，都有据可查。</h1>
            <p className="intro-copy">
              记录零食、派对和集体采购，随时查看谁支付、谁参与。
            </p>
          </div>
        </div>

        <div className="login-panel">
          <header className="login-header">
            <p className="eyebrow">欢迎回来</p>
            <h2 id="login-title">登录你的账户</h2>
            <p>使用团队分配给你的账号继续。</p>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="username">用户名</label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="请输入用户名"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="field">
              <label htmlFor="password">密码</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="请输入密码"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-message" aria-live="polite">
              {error ? <p role="alert">{error}</p> : null}
            </div>

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "正在登录…" : "登录"}
            </button>
          </form>

          <p className="login-help">无法登录？请联系管理员检查账号状态。</p>
        </div>
      </section>
    </main>
  );
}
