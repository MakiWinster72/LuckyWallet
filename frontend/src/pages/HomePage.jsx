import { Link } from "react-router-dom";

import { AppIcon } from "../components/AppIcon";
import { BrandIcon } from "../components/BrandIcon";
import "./HomePage.css";

const wikiUrl =
  import.meta.env.VITE_WIKI_URL?.trim() ||
  (import.meta.env.DEV ? "http://localhost:5174" : "/wiki/");

const steps = [
  {
    number: "01",
    title: "记下谁付款",
    detail: "金额、日期、分类和付款人都在同一张账单里。",
  },
  {
    number: "02",
    title: "选中参与成员",
    detail: "系统自动平均分摊，并把最后一分钱也算清楚。",
  },
  {
    number: "03",
    title: "看懂该给谁",
    detail: "成员净额和结算建议，把多笔来往合成更少的转账。",
  },
];

const featureNotes = [
  ["预算", "这个月花到哪里，一眼看见"],
  ["统计", "按时间、分类与成员拆开看"],
  ["成员", "付款、分摊和净额都有依据"],
];

export function HomePage() {
  return (
    <main className="home-page">
      <nav className="home-nav" aria-label="产品首页导航">
        <Link className="home-brand" to="/" aria-label="LuckyWallet 首页">
          <BrandIcon size={38} />
          <span>LuckyWallet</span>
        </Link>
        <div className="home-nav-links">
          <a className="home-section-link" href="#how-it-works">
            如何使用
          </a>
          <a className="home-section-link" href="#product-preview">
            产品预览
          </a>
          <a className="home-wiki-link" href={wikiUrl}>
            Wiki
          </a>
          <Link className="home-nav-login" to="/login">
            登录
            <AppIcon name="arrow" size={15} />
          </Link>
        </div>
      </nav>

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="home-eyebrow">
            <span aria-hidden="true">✦</span>
            为熟悉的人，算清楚每一笔
          </p>
          <h1 id="home-title">
            钱不该让
            <br />
            <em>关系变复杂。</em>
          </h1>
          <p className="home-hero-lead">
            LuckyWallet 记录谁付款、谁参与，并把分摊与结算讲得明明白白。
            适合家庭、室友、宿舍和每一个长期同行的小团队。
          </p>
          <div className="home-hero-actions">
            <Link className="home-primary-action" to="/login">
              打开我的账本
              <AppIcon name="arrow" size={18} />
            </Link>
            <a className="home-secondary-action" href={wikiUrl}>
              阅读使用 Wiki
            </a>
          </div>
          <dl className="home-trust-list">
            <div>
              <dt>平均分摊</dt>
              <dd>精确到分</dd>
            </div>
            <div>
              <dt>账目范围</dt>
              <dd>随时筛选</dd>
            </div>
            <div>
              <dt>数据归属</dt>
              <dd>自己部署</dd>
            </div>
          </dl>
        </div>

        <div className="home-wallet-stage" aria-label="LuckyWallet 产品界面预览">
          <div className="home-wallet-back" aria-hidden="true" />
          <div className="home-wallet-screen">
            <div className="home-screen-bar">
              <span>
                <i />
                账本已更新
              </span>
              <b>LW / 2026</b>
            </div>
            <img
              src="/Dashboard.png"
              alt="LuckyWallet 总览页面，展示支出、待结算和最近账单"
              width="1382"
              height="1041"
              fetchPriority="high"
            />
          </div>
          <div className="home-wallet-clasp" aria-hidden="true">
            <span>✦</span>
          </div>
          <div className="home-floating-receipt" aria-hidden="true">
            <span>本月账目</span>
            <strong>每一笔都有据可查</strong>
            <i />
            <small>付款 · 参与 · 分摊 · 结算</small>
          </div>
        </div>
      </section>

      <section
        className="home-process"
        id="how-it-works"
        aria-labelledby="process-title"
      >
        <header className="home-section-heading">
          <p>一笔账单的旅程</p>
          <h2 id="process-title">从垫付，到结清，只要三步。</h2>
          <span>规则简单，才更容易坚持记录。</span>
        </header>
        <div className="home-step-grid">
          {steps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <div className="home-step-icon" aria-hidden="true">
                <AppIcon
                  name={
                    step.number === "01"
                      ? "receipt"
                      : step.number === "02"
                        ? "users"
                        : "check"
                  }
                  size={23}
                />
              </div>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="home-showcase"
        id="product-preview"
        aria-labelledby="showcase-title"
      >
        <div className="home-showcase-visual">
          <div className="home-login-frame">
            <div className="home-frame-label">
              <span>EVERY BILL, CLEARLY SHARED</span>
              <b>账单明细一目了然</b>
            </div>
            <img
              src="/bills-page.png"
              alt="LuckyWallet 账单页面"
              width="1382"
              height="1041"
              loading="lazy"
            />
          </div>
        </div>
        <div className="home-showcase-copy">
          <p className="home-eyebrow">
            <span aria-hidden="true">✦</span>
            不只是记账
          </p>
          <h2 id="showcase-title">把日常来往，变成值得信任的记录。</h2>
          <p>
            从一顿饭到一次旅行，付款人和承担人往往不是同一群人。
            LuckyWallet 保留这层差别，也保留每次结算背后的依据。
          </p>
          <div className="home-feature-notes">
            {featureNotes.map(([title, detail]) => (
              <div key={title}>
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
            ))}
          </div>
          <Link className="home-text-link" to="/login">
            前往登录页面
            <AppIcon name="arrow" size={17} />
          </Link>
        </div>
      </section>

      <section className="home-final-cta" aria-labelledby="final-cta-title">
        <div>
          <p>READY WHEN YOU ARE</p>
          <h2 id="final-cta-title">下一笔，从清楚开始。</h2>
        </div>
        <div>
          <Link className="home-primary-action is-light" to="/login">
            登录 LuckyWallet
            <AppIcon name="arrow" size={18} />
          </Link>
          <a href={wikiUrl}>先看看 Wiki</a>
        </div>
      </section>

      <footer className="home-footer">
        <Link className="home-brand" to="/">
          <BrandIcon size={32} />
          <span>LuckyWallet</span>
        </Link>
        <p>为长期相处的人，留下一本清楚的账。</p>
        <span>© 2026 LuckyWallet</span>
      </footer>
    </main>
  );
}
