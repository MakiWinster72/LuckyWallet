import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/useAuth";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">L</span>
          <span>LuckyWallet</span>
        </div>
        <p className="eyebrow">账户已连接</p>
        <h1>你好，{user.nickname ?? user.username}</h1>
        <div className="account-summary">
          <span>{user.username}</span>
          <span>{user.role === "admin" ? "管理员" : "普通用户"}</span>
        </div>
        <button className="secondary-button" type="button" onClick={handleLogout}>
          退出登录
        </button>
      </section>
    </main>
  );
}
