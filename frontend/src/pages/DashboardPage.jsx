import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppIcon } from "../components/AppIcon";
import { MembersView } from "../components/MembersView";
import { useAuth } from "../auth/useAuth";
import { categories, formatMoney, initialBills, members } from "../data/demoData";

const STORAGE_KEY = "luckywallet.bills.v1";
const navItems = [
  ["home", "总览"], ["receipt", "账单"], ["users", "成员"], ["chart", "统计"],
];

function Avatar({ member, small = false }) {
  return <span className={`avatar ${small ? "avatar-small" : ""}`} style={{ "--avatar": member.color }}>{member.initials}</span>;
}

function BillRow({ bill, onOpen }) {
  const payer = members.find((member) => member.id === bill.payer);
  const category = categories[bill.category];
  return (
    <article className="bill-row">
      <span className="category-icon" style={{ "--category": category.color }}>{category.icon}</span>
      <div className="bill-main">
        <strong>{bill.title}</strong>
        <span>{bill.date.slice(5).replace("-", "月")}日 · {payer.name} 付款</span>
      </div>
      <div className="participant-stack" aria-label={`${bill.participants.length} 位成员参与`}>
        {bill.participants.slice(0, 3).map((id) => <Avatar key={id} member={members.find((member) => member.id === id)} small />)}
        {bill.participants.length > 3 ? <span className="avatar avatar-small avatar-more">+{bill.participants.length - 3}</span> : null}
      </div>
      <div className="bill-amount"><strong>{formatMoney(bill.amount)}</strong><span>人均 {formatMoney(bill.amount / bill.participants.length)}</span></div>
      <button className="row-action" onClick={() => onOpen(bill)} aria-label={`查看${bill.title}`}><AppIcon name="arrow" size={17} /></button>
    </article>
  );
}

function BillDetails({ bill, onClose }) {
  const payer = members.find((member) => member.id === bill.payer);
  const category = categories[bill.category];
  const share = bill.amount / bill.participants.length;

  return (
    <div className="detail-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="detail-drawer" role="dialog" aria-modal="true" aria-labelledby="bill-detail-title">
        <header>
          <div><span className="overline">BILL DETAILS</span><h2 id="bill-detail-title">账单详情</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="关闭"><AppIcon name="close" /></button>
        </header>
        <div className="detail-hero">
          <span className="detail-category" style={{ "--category": category.color }}>{category.icon}</span>
          <span>{bill.category}</span>
          <h3>{bill.title}</h3>
          <strong>{formatMoney(bill.amount)}</strong>
          <p><AppIcon name="calendar" size={15} /> {bill.date}</p>
        </div>
        <dl className="detail-facts">
          <div><dt>付款人</dt><dd><Avatar member={payer} small />{payer.name}</dd></div>
          <div><dt>参与人数</dt><dd>{bill.participants.length} 人</dd></div>
          <div><dt>分摊方式</dt><dd>平均分摊</dd></div>
        </dl>
        <section className="split-section">
          <header><h3>分摊明细</h3><span>每人 {formatMoney(share)}</span></header>
          <div>
            {bill.participants.map((id) => {
              const member = members.find((item) => item.id === id);
              return <article key={id}><Avatar member={member} /><span><strong>{member.name}</strong><small>{id === bill.payer ? "已付款" : "待结算"}</small></span><b>{formatMoney(share)}</b></article>;
            })}
          </div>
        </section>
        <section className="detail-note"><span>备注</span><p>{bill.note || "这笔账单没有备注。"}</p></section>
        <footer><span>账单编号</span><strong>LW-{String(bill.id).padStart(5, "0")}</strong></footer>
      </aside>
    </div>
  );
}

function AddBillDialog({ onClose, onSave }) {
  const [form, setForm] = useState({
    title: "", amount: "", category: "餐饮", payer: 1,
    participants: members.map((member) => member.id),
    date: new Date().toISOString().slice(0, 10), note: "",
  });
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleParticipant(id) {
    setForm((current) => ({
      ...current,
      participants: current.participants.includes(id)
        ? current.participants.filter((memberId) => memberId !== id)
        : [...current.participants, id],
    }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || Number(form.amount) <= 0 || form.participants.length === 0) {
      setError("请填写账单名称、有效金额，并至少选择一位参与者。");
      return;
    }
    onSave({ ...form, title: form.title.trim(), amount: Number(form.amount), payer: Number(form.payer) });
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="bill-dialog" role="dialog" aria-modal="true" aria-labelledby="new-bill-title">
        <header><div><span className="overline">NEW ENTRY</span><h2 id="new-bill-title">记一笔共同消费</h2></div><button className="icon-button" onClick={onClose} aria-label="关闭"><AppIcon name="close" /></button></header>
        <form onSubmit={submit}>
          <label className="field-wide">账单名称<input autoFocus value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="例如：周末火锅" /></label>
          <label>总金额<div className="money-input"><span>¥</span><input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => update("amount", e.target.value)} placeholder="0.00" /></div></label>
          <label>消费日期<input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} /></label>
          <fieldset className="field-wide"><legend>分类</legend><div className="category-options">
            {Object.entries(categories).map(([name, item]) => <button className={form.category === name ? "selected" : ""} type="button" key={name} onClick={() => update("category", name)}><span>{item.icon}</span>{name}</button>)}
          </div></fieldset>
          <label>付款人<select value={form.payer} onChange={(e) => update("payer", e.target.value)}>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
          <label>备注<input value={form.note} onChange={(e) => update("note", e.target.value)} placeholder="可选" /></label>
          <fieldset className="field-wide"><legend>参与分摊</legend><div className="member-options">
            {members.map((member) => <button type="button" className={form.participants.includes(member.id) ? "selected" : ""} key={member.id} onClick={() => toggleParticipant(member.id)}><Avatar member={member} small /><span>{member.name}</span><span className="check"><AppIcon name="check" size={13} /></span></button>)}
          </div></fieldset>
          {form.amount && form.participants.length ? <div className="split-preview field-wide"><span>平均分给 {form.participants.length} 人</span><strong>每人 {formatMoney(Number(form.amount) / form.participants.length)}</strong></div> : null}
          {error ? <p className="dialog-error field-wide" role="alert">{error}</p> : null}
          <footer className="field-wide"><button className="text-button" type="button" onClick={onClose}>取消</button><button className="primary-button" type="submit">保存账单</button></footer>
        </form>
      </section>
    </div>
  );
}

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("总览");
  const [query, setQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [dark, setDark] = useState(false);
  const [bills, setBills] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? initialBills; }
    catch { return initialBills; }
  });

  const visibleBills = useMemo(() => bills.filter((bill) =>
    bill.title.toLowerCase().includes(query.trim().toLowerCase()) ||
    bill.category.includes(query.trim())
  ), [bills, query]);
  const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const currentUser = members.find((member) => member.name.toLowerCase() === user.username?.toLowerCase()) ?? members[0];

  function saveBill(form) {
    const next = [{ ...form, id: Date.now() }, ...bills];
    setBills(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setIsAdding(false);
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className={`app-shell ${dark ? "theme-dark" : ""}`}>
      <aside className="sidebar">
        <div className="brand-lockup"><span className="brand-mark">L</span><span>LuckyWallet</span></div>
        <nav aria-label="主导航">{navItems.map(([icon, label]) => <button key={label} className={activeNav === label ? "active" : ""} onClick={() => setActiveNav(label)}><AppIcon name={icon} /><span>{label}</span></button>)}</nav>
        <div className="sidebar-note"><span>本月预算</span><strong>{formatMoney(total)} <small>/ ¥2,400</small></strong><div><i style={{ width: `${Math.min(total / 24, 100)}%` }} /></div><small>已使用 {Math.round(total / 24)}%</small></div>
        <div className="profile-card"><Avatar member={currentUser} /><span><strong>{user.nickname ?? user.username}</strong><small>{user.role === "admin" ? "管理员" : "团队成员"}</small></span><button className="profile-logout" type="button" onClick={handleLogout} aria-label="退出登录" title="退出登录"><AppIcon name="logout" size={17} /></button></div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">L</span><strong>LuckyWallet</strong></div>
          <label className="search-box"><AppIcon name="search" size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索账单或分类…" /></label>
          <div className="top-actions"><button className="icon-button" onClick={() => setDark((value) => !value)} aria-label="切换主题"><AppIcon name={dark ? "sun" : "moon"} /></button><button className="icon-button notification" aria-label="通知"><AppIcon name="bell" /></button><button className="add-button" onClick={() => setIsAdding(true)}><AppIcon name="plus" size={18} />记一笔</button></div>
        </header>

        <div className="dashboard-content">
          <section className="welcome"><div><p className="overline">JULY · SHARED WALLET</p><h1>{activeNav === "总览" ? `早上好，${user.nickname ?? user.username}` : activeNav}</h1><p>{activeNav === "总览" ? "五个人的小日子，每一笔都清清楚楚。" : "共同生活的账目，都在这里。"}</p></div><button className="add-button mobile-add" onClick={() => setIsAdding(true)}><AppIcon name="plus" size={18} />记一笔</button></section>

          {activeNav === "成员" ? <MembersView members={members} bills={bills} currentMemberId={currentUser.id} /> : <>
          <section className="summary-grid">
            <article className="hero-total"><span className="card-label">七月共同支出</span><strong>{formatMoney(total)}</strong><div className="trend-note"><AppIcon name="trend" size={16} /><span>比六月少 8.4%</span></div><div className="receipt-edge" /></article>
            <article className="summary-card"><span className="card-label">我的待结算</span><strong>{formatMoney(184.3)}</strong><span className="status-pill">3 笔待处理</span></article>
            <article className="summary-card"><span className="card-label">本月账单</span><strong>{bills.length}<small> 笔</small></strong><span className="muted">最近更新于今天</span></article>
          </section>

          <div className="content-grid">
            <section className="panel bill-panel"><header><div><span className="overline">RECENT ENTRIES</span><h2>最近账单</h2></div><button className="link-button" onClick={() => setActiveNav("账单")}>查看全部 <AppIcon name="arrow" size={15} /></button></header>
              <div className="bill-list">{visibleBills.length ? visibleBills.slice(0, activeNav === "账单" ? 20 : 5).map((bill) => <BillRow key={bill.id} bill={bill} onOpen={setSelectedBill} />) : <div className="empty-state">没有找到匹配的账单，换个关键词试试。</div>}</div>
            </section>
            <aside className="right-column">
              <section className="panel member-panel"><header><div><span className="overline">THE HOUSE</span><h2>共同成员</h2></div><span className="member-count">5 人</span></header><div className="member-list">{members.map((member, index) => <div key={member.id}><Avatar member={member} /><span><strong>{member.name}</strong><small>{index === 0 ? "本月垫付最多" : `${index + 1} 笔参与`}</small></span><b>{formatMoney([784, 213, 186.5, 64, 88][index])}</b></div>)}</div></section>
              <section className="settle-card"><span className="overline">QUICK SETTLE</span><h3>让欠款不过夜</h3><p>当前有 3 笔账单可以合并结算。</p><button onClick={() => setActiveNav("统计")}>查看结算方案 <AppIcon name="arrow" size={16} /></button></section>
            </aside>
          </div>
          </>}
        </div>
      </main>
      <nav className="mobile-nav">{navItems.map(([icon, label]) => <button key={label} className={activeNav === label ? "active" : ""} onClick={() => setActiveNav(label)}><AppIcon name={icon} /><span>{label}</span></button>)}</nav>
      {isAdding ? <AddBillDialog onClose={() => setIsAdding(false)} onSave={saveBill} /> : null}
      {selectedBill ? <BillDetails bill={selectedBill} onClose={() => setSelectedBill(null)} /> : null}
    </div>
  );
}
