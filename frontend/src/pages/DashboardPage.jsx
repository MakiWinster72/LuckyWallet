import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppIcon } from "../components/AppIcon";
import { AdminUsersView } from "../components/AdminUsersView";
import { BillsView } from "../components/BillsView";
import { MembersView } from "../components/MembersView";
import { SettlementDialog } from "../components/SettlementDialog";
import { createBillApi, deleteBillApi, listBillsApi, updateBillApi } from "../api/bills";
import { getBudgetApi, updateBudgetApi } from "../api/budget";
import { useAuth } from "../auth/useAuth";
import { resolveAssetUrl, uploadAvatarApi } from "../api/auth";
import { listMembersApi } from "../api/members";
import { categories, getCategory } from "../data/categories";
import { summarizeBudgetProgress } from "../data/budgetProgress";
import { getChineseMonthLabel, getLocalDateString, selectMonthlyBills, summarizeMonthlyBills } from "../data/monthlyBills";
import { summarizeMonthlyTrend } from "../data/monthlyTrend";
import { summarizeProfileFinance } from "../data/profileFinance";
import { buildDailySeries, buildMonthlySeries, buildSmoothSvgPath } from "../data/statisticsCharts";
import { downloadStatisticsCsv } from "../data/statisticsExport";
import { summarizeSpending } from "../data/spendingSummary";
import { summarizePendingSettlement } from "../data/settlementSummary";
import { formatMoney } from "../utils/money";

const sharedNavItems = [
  ["home", "总览"], ["receipt", "账单"], ["users", "成员"], ["chart", "统计"],
];

function Avatar({ member, small = false, avatarUrl = "" }) {
  if (avatarUrl) {
    return <span className={`avatar avatar-image ${small ? "avatar-small" : ""}`}><img src={resolveAssetUrl(avatarUrl)} alt="" /></span>;
  }
  if (!member) return <span className={`avatar ${small ? "avatar-small" : ""}`}>?</span>;
  return <span className={`avatar ${small ? "avatar-small" : ""}`} style={{ "--avatar": member.color }}>{member.initials}</span>;
}

function ProfileCenter({ user, member, finance, onClose, onUpdated }) {
  const [preview, setPreview] = useState(user.avatar_url ? resolveAssetUrl(user.avatar_url) : "");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ saving: false, error: "", success: "" });

  useEffect(() => () => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  function chooseAvatar(event) {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    if (nextFile.size > 5 * 1024 * 1024) {
      setStatus({ saving: false, error: "头像大小不能超过 5 MB", success: "" });
      event.target.value = "";
      return;
    }
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
    setStatus({ saving: false, error: "", success: "" });
  }

  async function saveAvatar() {
    if (!file) return;
    setStatus({ saving: true, error: "", success: "" });
    try {
      const nextUser = await uploadAvatarApi(file);
      onUpdated(nextUser);
      setFile(null);
      setPreview(resolveAssetUrl(nextUser.avatar_url));
      setStatus({ saving: false, error: "", success: "头像已保存" });
    } catch (error) {
      setStatus({ saving: false, error: error.message, success: "" });
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <header><div><span className="overline">MY PROFILE</span><h2 id="profile-title">个人中心</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="关闭">×</button></header>
        <div className="profile-avatar-editor">
          <span className="profile-avatar-preview">
            {preview ? <img src={preview} alt="当前头像预览" /> : <Avatar member={member} />}
          </span>
          <label className="secondary-button">选择头像<input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseAvatar} /></label>
          <small>支持 JPG、PNG、WebP，最大 5 MB</small>
        </div>
        <div className="profile-details"><span>显示名字</span><strong>{user.nickname?.trim() || user.username}</strong><small>@{user.username}</small></div>
        <section className="profile-finance" aria-labelledby="profile-finance-title">
          <header>
            <div><span className="overline">MY FINANCE</span><h3 id="profile-finance-title">收支概览</h3></div>
            <small>全部共同账单</small>
          </header>
          <div className="profile-finance-grid">
            <article>
              <span>我的付款</span>
              <strong>{formatMoney(finance.paid)}</strong>
              <div className="profile-ratio-track" aria-hidden="true"><i style={{ width: `${Math.min(finance.paidRatio, 100)}%` }} /></div>
              <small>占全部总支出 {finance.paidRatio.toFixed(1)}%</small>
            </article>
            <article>
              <span>我的分摊</span>
              <strong>{formatMoney(finance.share)}</strong>
              <div className="profile-ratio-track is-share" aria-hidden="true"><i style={{ width: `${Math.min(finance.shareRatio, 100)}%` }} /></div>
              <small>占全部总支出 {finance.shareRatio.toFixed(1)}%</small>
            </article>
          </div>
        </section>
        {status.error ? <p className="form-error" role="alert">{status.error}</p> : null}
        {status.success ? <p className="form-success" role="status">✓ {status.success}</p> : null}
        <footer><button className="text-button" type="button" onClick={onClose}>取消</button><button className="add-button" type="button" disabled={!file || status.saving} onClick={saveAvatar}>{status.saving ? "上传中…" : "保存头像"}</button></footer>
      </section>
    </div>
  );
}

function BillRow({ bill, members, onOpen }) {
  const payer = members.find((member) => member.id === bill.payer);
  const category = getCategory(bill.category);
  return (
    <article className="bill-row">
      <span className="category-icon" style={{ "--category": category.color }}>{category.icon}</span>
      <div className="bill-main">
        <strong>{bill.title}</strong>
        <span>{bill.date.slice(5).replace("-", "月")}日 · {payer?.name ?? "未知成员"} 付款</span>
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

function BillDetails({ bill, members, onClose, onDelete, onEdit }) {
  const payer = members.find((member) => member.id === bill.payer);
  const category = getCategory(bill.category);
  const share = bill.participants.length ? bill.amount / bill.participants.length : 0;

  return (
    <div className="detail-backdrop" role="presentation">
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
          <div><dt>付款人</dt><dd><Avatar member={payer} small />{payer?.name ?? "未知成员"}</dd></div>
          <div><dt>参与人数</dt><dd>{bill.participants.length} 人</dd></div>
          <div><dt>分摊方式</dt><dd>平均分摊</dd></div>
        </dl>
        <section className="split-section">
          <header><h3>分摊明细</h3><span>每人 {formatMoney(share)}</span></header>
          <div>
            {bill.participants.map((id) => {
              const member = members.find((item) => item.id === id);
              return <article key={id}><Avatar member={member} /><span><strong>{member?.name ?? "未知成员"}</strong><small>{id === bill.payer ? "已付款" : "待结算"}</small></span><b>{formatMoney(share)}</b></article>;
            })}
          </div>
        </section>
        <section className="detail-note"><span>备注</span><p>{bill.note || "这笔账单没有备注。"}</p></section>
        <footer className="detail-footer">
          <span>LW-{String(bill.id).padStart(5, "0")}</span>
          <div><button className="text-button danger-button" type="button" onClick={() => onDelete(bill)}>删除</button><button className="edit-button" type="button" onClick={() => onEdit(bill)}><AppIcon name="edit" size={15} />编辑账单</button></div>
        </footer>
      </aside>
    </div>
  );
}

function AddBillDialog({ members, initialBill = null, onClose, onSave }) {
  const [form, setForm] = useState(() => initialBill ?? ({
    title: "", amount: "", category: "餐饮", payer: members[0]?.id ?? "",
    participants: members.map((member) => member.id),
    date: new Date().toISOString().slice(0, 10), note: "",
  }));
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
    <div className="dialog-backdrop" role="presentation">
      <section className="bill-dialog" role="dialog" aria-modal="true" aria-labelledby="new-bill-title">
        <header><div><span className="overline">{initialBill ? "EDIT ENTRY" : "NEW ENTRY"}</span><h2 id="new-bill-title">{initialBill ? "编辑共同消费" : "记一笔共同消费"}</h2></div><button className="icon-button" onClick={onClose} aria-label="关闭"><AppIcon name="close" /></button></header>
        <form onSubmit={submit}>
          <label className="field-wide">账单名称<input name="bill-title" autoComplete="off" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="例如：周末火锅…" /></label>
          <label>总金额<div className="money-input"><span>¥</span><input name="bill-amount" type="number" inputMode="decimal" autoComplete="off" min="0.01" step="0.01" value={form.amount} onChange={(e) => update("amount", e.target.value)} placeholder="0.00" /></div></label>
          <label>消费日期<input name="bill-date" type="date" autoComplete="off" value={form.date} onChange={(e) => update("date", e.target.value)} /></label>
          <fieldset className="field-wide"><legend>分类</legend><div className="category-options">
            {Object.entries(categories).map(([name, item]) => <button className={form.category === name ? "selected" : ""} type="button" key={name} onClick={() => update("category", name)}><span>{item.icon}</span>{name}</button>)}
          </div></fieldset>
          <label>付款人<select name="bill-payer" value={form.payer} onChange={(e) => update("payer", e.target.value)}>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
          <label>备注<input name="bill-note" autoComplete="off" value={form.note} onChange={(e) => update("note", e.target.value)} placeholder="可选…" /></label>
          <fieldset className="field-wide"><legend>参与分摊</legend><div className="member-options">
            {members.map((member) => <button type="button" className={form.participants.includes(member.id) ? "selected" : ""} key={member.id} onClick={() => toggleParticipant(member.id)}><Avatar member={member} small /><span>{member.name}</span><span className="check"><AppIcon name="check" size={13} /></span></button>)}
          </div></fieldset>
          {form.amount && form.participants.length ? <div className="split-preview field-wide"><span>平均分给 {form.participants.length} 人</span><strong>每人 {formatMoney(Number(form.amount) / form.participants.length)}</strong></div> : null}
          {error ? <p className="dialog-error field-wide" role="alert">{error}</p> : null}
          <footer className="field-wide"><button className="text-button" type="button" onClick={onClose}>取消</button><button className="primary-button" type="submit">{initialBill ? "保存修改" : "保存账单"}</button></footer>
        </form>
      </section>
    </div>
  );
}

function StatisticsView({ bills, members }) {
  const referenceDate = useMemo(() => getLocalDateString(), []);
  const month = referenceDate.slice(0, 7);
  const monthlyBills = useMemo(
    () => selectMonthlyBills(bills, referenceDate),
    [bills, referenceDate],
  );
  const summary = useMemo(
    () => summarizeSpending(monthlyBills, members),
    [monthlyBills, members],
  );
  const monthlySeries = useMemo(
    () => buildMonthlySeries(bills, referenceDate),
    [bills, referenceDate],
  );
  const dailySeries = useMemo(
    () => buildDailySeries(bills, referenceDate),
    [bills, referenceDate],
  );
  const maximumMonth = Math.max(...monthlySeries.map((item) => item.total), 1);
  const maximumDay = Math.max(...dailySeries.map((item) => item.total), 1);
  const maximumPayer = Math.max(...summary.byPayer.map((item) => item.amount), 1);
  const dailyCoordinates = dailySeries.map((item, index) => {
    const x = 12 + index * (476 / Math.max(dailySeries.length - 1, 1));
    const y = 132 - (item.total / maximumDay) * 112;
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });
  const dailyPath = buildSmoothSvgPath(dailyCoordinates);
  let categoryOffset = 0;
  const categoryGradient = summary.byCategory.length
    ? `conic-gradient(${summary.byCategory.map((item) => {
      const start = categoryOffset;
      categoryOffset += item.amount / summary.total * 100;
      return `${item.color} ${start}% ${categoryOffset}%`;
    }).join(", ")})`
    : "var(--soft)";
  const hasSpending = monthlyBills.length > 0;

  function exportReport() {
    downloadStatisticsCsv({ month, bills: monthlyBills, members });
  }

  return (
    <section className="statistics-view" aria-labelledby="statistics-title">
      <header className="statistics-heading">
        <div>
          <span className="overline">SPENDING INSIGHTS</span>
          <h2 id="statistics-title">本月支出统计</h2>
          <p>从时间、分类与成员付款三个维度了解共同消费。</p>
        </div>
        <button className="statistics-export" type="button" onClick={exportReport}><AppIcon name="download" size={17} />导出 CSV</button>
      </header>
      <div className="stats-kpis">
        <article><span>本月总支出</span><strong>{formatMoney(summary.total)}</strong><small>全部共同账单</small></article>
        <article><span>平均每笔</span><strong>{formatMoney(summary.average)}</strong><small>共 {monthlyBills.length} 笔消费</small></article>
        <article><span>最高分类</span><strong>{summary.byCategory[0]?.name ?? "暂无"}</strong><small>{formatMoney(summary.byCategory[0]?.amount ?? 0)}</small></article>
      </div>
      <div className="stats-trend-grid">
        <article className="panel monthly-chart">
          <header><div><span className="overline">6-MONTH RHYTHM</span><h2>月度支出趋势</h2></div><span className="chart-caption">近 6 个月</span></header>
          <div className="month-bars" role="img" aria-label="近六个月支出柱状图">
            {monthlySeries.map((item) => <div key={item.month}><strong>{item.total ? formatMoney(item.total) : "—"}</strong><span><i style={{ height: `${Math.max(item.total / maximumMonth * 100, item.total ? 8 : 2)}%` }} /></span><small>{item.label}</small></div>)}
          </div>
        </article>
        <article className="panel daily-chart">
          <header><div><span className="overline">DAILY PULSE</span><h2>每日支出走势</h2></div><span className="chart-caption">{Number(month.slice(5))}月</span></header>
          <div className="daily-line">
            <svg viewBox="0 0 500 150" role="img" aria-label="本月每日支出折线图" preserveAspectRatio="none">
              <path d="M12 132H488M12 76H488M12 20H488" className="chart-grid-line" />
              <path d={dailyPath} className="daily-curve" />
              {dailySeries.filter((item) => item.total > 0).map((item) => {
                const index = item.day - 1;
                const x = 12 + index * (476 / Math.max(dailySeries.length - 1, 1));
                const y = 132 - (item.total / maximumDay) * 112;
                return <circle key={item.date} cx={x} cy={y} r="3.5"><title>{item.day}日 {formatMoney(item.total)}</title></circle>;
              })}
            </svg>
            <div><span>1日</span><span>{Math.ceil(dailySeries.length / 2)}日</span><span>{dailySeries.length}日</span></div>
          </div>
        </article>
      </div>
      {hasSpending ? <div className="stats-layout">
        <article className="panel category-chart">
          <header><div><span className="overline">CATEGORY MIX</span><h2>分类占比</h2></div><span className="chart-caption">本月构成</span></header>
          <div className="category-donut-layout">
            <div className="category-donut" style={{ background: categoryGradient }} role="img" aria-label="本月分类支出环形图"><span><strong>{summary.byCategory.length}</strong><small>个分类</small></span></div>
            <div className="category-legend">
              {summary.byCategory.map((item) => <div key={item.name}><i style={{ background: item.color }} /><span><strong>{item.name}</strong><small>{(item.amount / summary.total * 100).toFixed(1)}% · {item.count} 笔</small></span><b>{formatMoney(item.amount)}</b></div>)}
            </div>
          </div>
        </article>
        <article className="panel payer-chart">
          <header><div><span className="overline">PAID BY</span><h2>成员垫付</h2></div></header>
          <div className="payer-list">
            {summary.byPayer.map((member, index) => (
              <div key={member.id}>
                <span className="rank">{String(index + 1).padStart(2, "0")}</span>
                <Avatar member={member} />
                <span><strong>{member.name}</strong><i role="progressbar" aria-label={`${member.name}垫付占最高垫付金额的比例`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(member.amount / maximumPayer * 100)}><b style={{ width: `${member.amount / maximumPayer * 100}%` }} /></i></span>
                <strong>{formatMoney(member.amount)}</strong>
              </div>
            ))}
          </div>
        </article>
      </div> : <div className="statistics-empty"><span aria-hidden="true">⌁</span><h3>本月还没有支出</h3><p>记录第一笔共同消费后，这里会生成分类与成员垫付统计。</p></div>}
    </section>
  );
}

function DeleteBillDialog({ bill, onCancel, onConfirm }) {
  return (
    <div className="dialog-backdrop">
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-bill-title" aria-describedby="delete-bill-copy">
        <span className="confirm-icon" aria-hidden="true">!</span>
        <h2 id="delete-bill-title">删除“{bill.title}”？</h2>
        <p id="delete-bill-copy">账单和所有分摊明细都会删除，此操作无法撤销。</p>
        <footer><button className="text-button" type="button" onClick={onCancel}>取消</button><button className="delete-button" type="button" onClick={() => onConfirm(bill.id)}>确认删除</button></footer>
      </section>
    </div>
  );
}

function BudgetCard({ spending, summary, canEdit, onEdit }) {
  const content = <>
    <span>本月预算</span>
    <strong>{formatMoney(spending)} <small>/ {formatMoney(summary.budget)}</small></strong>
    <div><i style={{ width: `${summary.progress}%` }} /></div>
    <small>已使用 {summary.percentage}%{canEdit ? " · 点击设置" : ""}</small>
  </>;

  return canEdit
    ? <button className="sidebar-note is-editable" type="button" onClick={onEdit} aria-label={`设置本月预算，当前${formatMoney(summary.budget)}`}>{content}</button>
    : <div className="sidebar-note">{content}</div>;
}

function BudgetDialog({ budget, onClose, onSaved }) {
  const [value, setValue] = useState(String(budget));
  const [status, setStatus] = useState({ saving: false, error: "", success: "" });
  const parsedValue = Number(value);
  const isValid = Number.isFinite(parsedValue) && parsedValue > 0;

  async function saveBudget(event) {
    event.preventDefault();
    if (!isValid) {
      setStatus({ saving: false, error: "月预算必须大于 0", success: "" });
      return;
    }

    setStatus({ saving: true, error: "", success: "" });
    try {
      const savedBudget = await updateBudgetApi(parsedValue);
      onSaved(savedBudget);
      setValue(String(savedBudget));
      setStatus({ saving: false, error: "", success: "预算已保存" });
    } catch (error) {
      setStatus({ saving: false, error: error.message, success: "" });
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="budget-dialog" onSubmit={saveBudget} role="dialog" aria-modal="true" aria-labelledby="budget-dialog-title">
        <header><div><span className="overline">HOUSEHOLD BUDGET</span><h2 id="budget-dialog-title">设置本月预算</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="关闭">×</button></header>
        <p>预算会应用于所有成员的总览，并保存在家庭账户中。</p>
        <label>月预算金额<span className="money-input"><b>¥</b><input type="number" min="0.01" step="0.01" value={value} onChange={(event) => { setValue(event.target.value); setStatus({ saving: false, error: "", success: "" }); }} autoFocus /></span></label>
        {status.error ? <p className="form-error" role="alert">{status.error}</p> : null}
        {status.success ? <p className="form-success" role="status">{status.success}</p> : null}
        <footer><button className="text-button" type="button" onClick={onClose}>取消</button><button className="add-button" type="submit" disabled={!isValid || status.saving}>{status.saving ? "保存中…" : "保存预算"}</button></footer>
      </form>
    </div>
  );
}

export function DashboardPage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("总览");
  const [query, setQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [deletingBill, setDeletingBill] = useState(null);
  const [dark, setDark] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(2400);
  const [bills, setBills] = useState([]);
  const [members, setMembers] = useState([]);
  const [billStatus, setBillStatus] = useState({ loading: true, error: "" });
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const navItems = user.role === "admin"
    ? [...sharedNavItems, ["shield", "用户管理"]]
    : sharedNavItems;
  const isUserManagement = activeNav === "用户管理";

  useEffect(() => {
    let ignore = false;
    async function loadDashboard() {
      try {
        const [billResult, memberResult, budgetResult] = await Promise.all([
          listBillsApi(),
          listMembersApi(),
          getBudgetApi(),
        ]);
        if (!ignore) {
          setBills(billResult);
          setMembers(memberResult);
          setMonthlyBudget(budgetResult);
          setBillStatus({ loading: false, error: "" });
        }
      } catch (error) {
        if (!ignore) setBillStatus({ loading: false, error: error.message });
      }
    }
    void loadDashboard();
    return () => { ignore = true; };
  }, []);

  const visibleBills = useMemo(() => bills.filter((bill) =>
    bill.title.toLowerCase().includes(query.trim().toLowerCase()) ||
    bill.category.includes(query.trim())
  ), [bills, query]);
  const referenceDate = useMemo(() => getLocalDateString(), []);
  const monthlySummary = useMemo(
    () => summarizeMonthlyBills(bills, referenceDate),
    [bills, referenceDate],
  );
  const monthlyTrend = useMemo(
    () => summarizeMonthlyTrend(bills, referenceDate),
    [bills, referenceDate],
  );
  const monthLabel = getChineseMonthLabel(referenceDate);
  const budgetSummary = summarizeBudgetProgress(monthlySummary.total, monthlyBudget);
  const currentUser = members.find((member) => member.id === Number(user.id));
  const overviewStats = useMemo(
    () => summarizeSpending(monthlySummary.bills, members),
    [monthlySummary.bills, members],
  );
  const pendingSettlement = useMemo(
    () => summarizePendingSettlement(bills, currentUser?.id),
    [bills, currentUser?.id],
  );
  const profileFinance = useMemo(
    () => summarizeProfileFinance(bills, currentUser?.id),
    [bills, currentUser?.id],
  );

  async function saveBill(form) {
    try {
      const createdBill = await createBillApi(form);
      setBills((currentBills) => [createdBill, ...currentBills]);
      setBillStatus({ loading: false, error: "" });
      setIsAdding(false);
    } catch (error) {
      setBillStatus({ loading: false, error: error.message });
    }
  }

  async function updateBill(form) {
    try {
      const updatedBill = await updateBillApi(form);
      setBills((currentBills) => currentBills.map((bill) => bill.id === updatedBill.id ? updatedBill : bill));
      setEditingBill(null);
      setBillStatus({ loading: false, error: "" });
    } catch (error) {
      setBillStatus({ loading: false, error: error.message });
    }
  }

  async function deleteBill(billId) {
    try {
      await deleteBillApi(billId);
      setBills((currentBills) => currentBills.filter((bill) => bill.id !== billId));
      setDeletingBill(null);
      setBillStatus({ loading: false, error: "" });
    } catch (error) {
      setBillStatus({ loading: false, error: error.message });
    }
  }

  function startEditing(bill) {
    setSelectedBill(null);
    setEditingBill(bill);
  }

  function startDeleting(bill) {
    setSelectedBill(null);
    setDeletingBill(bill);
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
        <BudgetCard spending={monthlySummary.total} summary={budgetSummary} canEdit={user.role === "admin"} onEdit={() => setIsBudgetOpen(true)} />
        <div className="profile-card" role="button" tabIndex={0} onClick={() => setIsProfileOpen(true)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setIsProfileOpen(true); }}><Avatar member={currentUser} avatarUrl={user.avatar_url} /><span><strong>{user.nickname ?? user.username}</strong><small>{user.role === "admin" ? "管理员" : "团队成员"}</small></span><button className="profile-logout" type="button" onClick={(event) => { event.stopPropagation(); handleLogout(); }} aria-label="退出登录" title="退出登录"><AppIcon name="logout" size={17} /></button></div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">L</span><strong>LuckyWallet</strong></div>
          {isUserManagement || activeNav === "账单" ? <span /> : <label className="search-box"><AppIcon name="search" size={18} /><input name="global-search" type="search" aria-label="搜索账单或分类" autoComplete="off" spellCheck={false} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索账单或分类…" /></label>}
          <div className="top-actions"><button className="icon-button" onClick={() => setDark((value) => !value)} aria-label="切换主题"><AppIcon name={dark ? "sun" : "moon"} /></button><button className="icon-button notification" aria-label="通知"><AppIcon name="bell" /></button>{isUserManagement ? null : <button className="add-button" onClick={() => setIsAdding(true)}><AppIcon name="plus" size={18} />记一笔</button>}</div>
        </header>

        <div className="dashboard-content">
          {billStatus.loading ? <div className="data-notice" role="status">正在加载账单…</div> : null}
          {billStatus.error ? <div className="data-notice is-error" role="alert">{billStatus.error} 请确认后端服务与数据库已经启动。</div> : null}
          {isUserManagement ? null : <section className="welcome"><div><p className="overline">JULY · SHARED WALLET</p><h1>{activeNav === "总览" ? `早上好，${user.nickname ?? user.username}` : activeNav}</h1><p>{activeNav === "总览" ? "共同生活的每一笔，都清清楚楚。" : "共同生活的账目，都在这里。"}</p></div><button className="add-button mobile-add" onClick={() => setIsAdding(true)}><AppIcon name="plus" size={18} />记一笔</button></section>}

          {isUserManagement ? <AdminUsersView currentUserId={Number(user.id)} />
            : activeNav === "账单" ? <BillsView bills={bills} members={members} onAdd={() => setIsAdding(true)} onOpen={setSelectedBill} />
            : activeNav === "成员" ? <MembersView members={members} bills={bills} currentMemberId={currentUser?.id} />
              : activeNav === "统计" ? <StatisticsView bills={bills} members={members} /> : <>
          <section className="summary-grid">
            <article className="hero-total"><span className="card-label">{monthLabel}共同支出</span><strong>{formatMoney(monthlySummary.total)}</strong><div className={`trend-note trend-${monthlyTrend.direction}`}><AppIcon name={monthlyTrend.direction === "down" ? "trendDown" : monthlyTrend.direction === "flat" ? "minus" : "trend"} size={16} /><span>{monthlyTrend.label}</span></div><div className="receipt-edge" /></article>
            <article className="summary-card"><span className="card-label">我的待结算</span><strong>{formatMoney(pendingSettlement.amount)}</strong><span className="status-pill">{pendingSettlement.count} 笔待处理</span></article>
            <article className="summary-card"><span className="card-label">本月账单</span><strong>{monthlySummary.count}<small> 笔</small></strong><span className="muted">最近更新于今天</span></article>
          </section>

          <div className="content-grid">
            <section className="panel bill-panel"><header><div><span className="overline">RECENT ENTRIES</span><h2>最近账单</h2></div><button className="link-button" onClick={() => setActiveNav("账单")}>查看全部 <AppIcon name="arrow" size={15} /></button></header>
              <div className="bill-list">{visibleBills.length ? visibleBills.slice(0, 5).map((bill) => <BillRow key={bill.id} bill={bill} members={members} onOpen={setSelectedBill} />) : <div className="empty-state">没有找到匹配的账单，换个关键词试试。</div>}</div>
            </section>
            <aside className="right-column">
              <section className="panel member-panel"><header><div><span className="overline">THE HOUSE</span><h2>共同成员</h2></div><span className="member-count">{members.length} 人</span></header><div className="member-list">{overviewStats.byPayer.map((member) => <div key={member.id}><Avatar member={member} /><span><strong>{member.name}</strong><small>{member.amount > 0 ? "本月有垫付" : "暂无垫付"}</small></span><b>{formatMoney(member.amount)}</b></div>)}</div></section>
              <section className="settle-card"><span className="overline">QUICK SETTLE</span><h3>让欠款不过夜</h3><p>{pendingSettlement.count ? `当前有 ${pendingSettlement.count} 笔账单可以合并结算。` : "当前没有需要结算的账单。"}</p><button onClick={() => setIsSettlementOpen(true)}>查看结算方案 <AppIcon name="arrow" size={16} /></button></section>
            </aside>
          </div>
          </>}
        </div>
      </main>
      <nav className="mobile-nav">{navItems.map(([icon, label]) => <button key={label} className={activeNav === label ? "active" : ""} onClick={() => setActiveNav(label)}><AppIcon name={icon} /><span>{label}</span></button>)}</nav>
      {isAdding ? <AddBillDialog members={members} onClose={() => setIsAdding(false)} onSave={saveBill} /> : null}
      {selectedBill ? <BillDetails bill={selectedBill} members={members} onClose={() => setSelectedBill(null)} onEdit={startEditing} onDelete={startDeleting} /> : null}
      {editingBill ? <AddBillDialog members={members} initialBill={editingBill} onClose={() => setEditingBill(null)} onSave={updateBill} /> : null}
      {deletingBill ? <DeleteBillDialog bill={deletingBill} onCancel={() => setDeletingBill(null)} onConfirm={deleteBill} /> : null}
      {isProfileOpen ? <ProfileCenter user={user} member={currentUser} finance={profileFinance} onClose={() => setIsProfileOpen(false)} onUpdated={updateUser} /> : null}
      {isSettlementOpen ? <SettlementDialog bills={bills} members={members} onClose={() => setIsSettlementOpen(false)} /> : null}
      {isBudgetOpen ? <BudgetDialog budget={monthlyBudget} onClose={() => setIsBudgetOpen(false)} onSaved={setMonthlyBudget} /> : null}
    </div>
  );
}
