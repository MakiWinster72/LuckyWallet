import { useMemo, useState } from "react";

import { formatMoney } from "../utils/money";
import { summarizeMemberFinance } from "../data/memberFinance";
import { buildMemberStats, summarizeMembers } from "../data/memberStats";
import { getLocalDateString } from "../data/monthlyBills";
import { buildSmoothSvgPath } from "../data/statisticsCharts";
import { UserAvatar } from "./UserAvatar";

const filters = [
  ["all", "全部成员"],
  ["credit", "待收款"],
  ["debit", "待补款"],
];

function MemberFinanceChart({ finance }) {
  const maximum = Math.max(
    ...finance.series.flatMap((item) => [item.expense, item.income]),
    1,
  );
  const coordinates = (key) => finance.series.map((item, index) => ({
    x: 10 + index * 80,
    y: Number((125 - item[key] / maximum * 105).toFixed(1)),
  }));
  const expensePoints = coordinates("expense");
  const incomePoints = coordinates("income");

  return (
    <div className="member-finance-chart">
      <div className="member-chart-legend"><span className="is-expense"><i />个人支出</span><span className="is-income"><i />收入（应收）</span></div>
      <svg viewBox="0 0 420 145" role="img" aria-label="近六个月个人支出与应收收入曲线">
        <path d="M10 125H410M10 72.5H410M10 20H410" className="member-chart-grid" />
        <path d={buildSmoothSvgPath(expensePoints)} className="member-expense-curve" />
        <path d={buildSmoothSvgPath(incomePoints)} className="member-income-curve" />
        {expensePoints.map((point, index) => <circle className="member-expense-point" key={`expense-${finance.series[index].month}`} cx={point.x} cy={point.y} r="3"><title>{finance.series[index].label}支出 {formatMoney(finance.series[index].expense)}</title></circle>)}
        {incomePoints.map((point, index) => <circle className="member-income-point" key={`income-${finance.series[index].month}`} cx={point.x} cy={point.y} r="3"><title>{finance.series[index].label}应收 {formatMoney(finance.series[index].income)}</title></circle>)}
      </svg>
      <div className="member-chart-axis">{finance.series.map((item) => <span key={item.month}>{item.label}</span>)}</div>
    </div>
  );
}

export function MembersView({ members, bills, currentMemberId }) {
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [referenceDate] = useState(() => getLocalDateString());
  const stats = useMemo(() => buildMemberStats(members, bills), [members, bills]);
  const summary = useMemo(() => summarizeMembers(stats), [stats]);
  const visibleMembers = stats.filter((item) => (
    filter === "credit" ? item.balance > 0
      : filter === "debit" ? item.balance < 0
        : true
  ));
  const selected = stats.find((item) => item.member.id === selectedId);
  const selectedFinance = useMemo(
    () => selected ? summarizeMemberFinance(bills, selected.member.id, referenceDate) : null,
    [bills, selected, referenceDate],
  );

  return (
    <section className="members-view" aria-labelledby="members-title">
      <header className="members-heading">
        <div><span className="overline">THE HOUSE</span><h2 id="members-title">共同成员</h2><p>看看每个人这个月的参与和垫付情况。</p></div>
        <span className="member-total">{members.length} 位成员</span>
      </header>

      <div className="member-summary">
        <article><span>团队成员</span><strong>{members.length}<small> 人</small></strong><p>成员账户由管理员统一维护</p></article>
        <article><span>共同垫付</span><strong>{formatMoney(summary.paid)}</strong><p>账目记录中的付款总额</p></article>
        <article><span>待收回金额</span><strong>{formatMoney(summary.positive)}</strong><p>结算后即可清零</p></article>
      </div>

      <div className="member-toolbar" role="group" aria-label="筛选成员">
        {filters.map(([value, label]) => (
          <button type="button" className={filter === value ? "active" : ""} key={value} onClick={() => setFilter(value)}>{label}</button>
        ))}
      </div>

      <div className="member-card-grid">
        {visibleMembers.map((item) => (
          <article className="member-card" key={item.member.id} role="button" tabIndex={0} onClick={() => setSelectedId(item.member.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedId(item.member.id); }}>
            <header>
              <UserAvatar user={item.member} variant="member" />
              <div><h3>{item.member.name}{item.member.id === currentMemberId ? <small> 我</small> : null}</h3><span>最近参与 {item.lastActive ?? "暂无记录"}</span></div>
              <span className="member-card-more" aria-hidden="true">•••</span>
            </header>
            <dl>
              <div><dt>本月垫付</dt><dd>{formatMoney(item.paid)}</dd></div>
              <div><dt>参与账单</dt><dd>{item.billCount} 笔</dd></div>
            </dl>
            <footer className={item.balance >= 0 ? "is-credit" : "is-debit"}>
              <span>{item.balance >= 0 ? "应收回" : "应补款"}</span>
              <strong>{formatMoney(Math.abs(item.balance))}</strong>
            </footer>
          </article>
        ))}
      </div>

      {selected && selectedFinance ? (
        <div className="member-detail-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedId(null)}>
          <aside className="member-detail" role="dialog" aria-modal="true" aria-labelledby="member-detail-title">
            <button className="member-detail-close" type="button" onClick={() => setSelectedId(null)} aria-label="关闭">×</button>
            <UserAvatar user={selected.member} variant="memberDetail" />
            <span className="overline">MEMBER PROFILE</span>
            <h2 id="member-detail-title">{selected.member.name}</h2>
            <p>最近参与 {selected.lastActive ?? "暂无记录"}</p>
            <dl>
              <div><dt>累计垫付</dt><dd>{formatMoney(selected.paid)}</dd></div>
              <div><dt>个人分摊</dt><dd>{formatMoney(selected.share)}</dd></div>
              <div><dt>参与账单</dt><dd>{selected.billCount} 笔</dd></div>
            </dl>
            <div className={selected.balance >= 0 ? "member-balance is-credit" : "member-balance is-debit"}>
              <span>{selected.balance >= 0 ? "当前应收回" : "当前应补款"}</span>
              <strong>{formatMoney(Math.abs(selected.balance))}</strong>
            </div>
            <section className="member-finance" aria-labelledby="member-finance-title">
              <header><div><span className="overline">CASH FLOW</span><h3 id="member-finance-title">收支统计</h3></div><small>收入按代付应收口径</small></header>
              <div className="member-finance-kpis">
                <article><span>个人支出</span><strong>{formatMoney(selectedFinance.expense)}</strong></article>
                <article><span>收入（应收）</span><strong>{formatMoney(selectedFinance.income)}</strong></article>
                <article><span>收支差额</span><strong className={selectedFinance.net >= 0 ? "is-positive" : "is-negative"}>{formatMoney(selectedFinance.net)}</strong></article>
              </div>
              <MemberFinanceChart finance={selectedFinance} />
            </section>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
