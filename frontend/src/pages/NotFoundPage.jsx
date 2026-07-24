import { Link, useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="not-found-page">
      <section className="not-found-shell" aria-labelledby="not-found-title">
        <div className="not-found-copy">
          <Link className="brand-lockup not-found-brand" to="/dashboard">
            <span className="brand-mark" aria-hidden="true">L</span>
            <span>LuckyWallet</span>
          </Link>

          <div>
            <p className="not-found-code" aria-label="错误代码 404">404</p>
            <p className="eyebrow">记账本好像没找到</p>
            <h1 id="not-found-title">页面发现错误</h1>
            <p className="not-found-description">
              你访问的地址可能已被移动、删除，或者从未存在。别担心，你的账单数据仍然安全！
            </p>

            <div className="not-found-actions">
              <Link className="primary-button not-found-link" to="/dashboard">
                回到首页
              </Link>
              <button
                className="secondary-button"
                type="button"
                onClick={() => navigate(-1)}
              >
                返回上一页
              </button>
            </div>
          </div>

          <p className="not-found-help">
            如果你认为这是一个错误，请联系管理员并提供当前页面地址并核对。
          </p>
        </div>

        <div className="not-found-visual" aria-hidden="true">
          <span className="lost-orbit lost-orbit-large" />
          <span className="lost-orbit lost-orbit-small" />
          <div className="lost-wallet">
            <span className="lost-wallet-flap" />
            <span className="lost-wallet-button" />
            <span className="lost-receipt">
              <span />
              <span />
              <span />
            </span>
          </div>
          <span className="lost-coin lost-coin-one">¥</span>
          <span className="lost-coin lost-coin-two">¥</span>
        </div>
      </section>
    </main>
  );
}
