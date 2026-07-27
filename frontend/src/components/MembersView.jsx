import { useMemo, useState } from "react";

import { formatMoney } from "../data/demoData";
import { buildMemberStats, summarizeMembers } from "../data/memberStats";

function MemberAvatar({ member }) {
  return <span className="member-avatar" style={{ "--avatar": member.color }}>{member.initials}</span>;
}

const filters = [
  ["all", "全部成员"],
  ["credit", "待收款"],
  ["debit", "待补款"],
];

export function MembersView({ members, bills, currentMemberId }) {
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const stats = useMemo(() => buildMemberStats(members, bills), [members, bills]);
  const summary = useMemo(() => summarizeMembers(stats), [stats]);
  const visibleMembers = stats.filter((item) => (
    filter === "credit" ? item.balance > 0
      : filter === "debit" ? item.balance < 0
        : true
  ));
  const selected = stats.find((item) => item.member.id === selectedId);

  return (
    <section className="members-view" aria-labelledby="members-title">
      <header className="members-heading">
        <div><span className="overline">THE HOUSE</span><h2 id="members-title">共同成员</h2><p>看看每个人这个月的参与和垫付情况。</p></div>
        <span className="member-total">{summary.active} / {members.length} 已加入</span>
      </header>

      <div className="member-summary">
        <article><span>团队成员</span><strong>{members.length}<small> 人</small></strong><p>本月全部成员都有参与</p></article>
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
          <article className="member-card" key={item.member.id}>
            <header>
              <MemberAvatar member={item.member} />
              <div><h3>{item.member.name}{item.member.id === currentMemberId ? <small> 我</small> : null}</h3><span><i />{item.status}</span></div>
              <button type="button" onClick={() => setSelectedId(item.member.id)} aria-label={`查看 ${item.member.name} 的明细`}>•••</button>
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

      {selected ? (
        <div className="member-detail-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedId(null)}>
          <aside className="member-detail" role="dialog" aria-modal="true" aria-labelledby="member-detail-title">
            <button className="member-detail-close" type="button" onClick={() => setSelectedId(null)} aria-label="关闭">×</button>
            <MemberAvatar member={selected.member} />
            <span className="overline">MEMBER PROFILE</span>
            <h2 id="member-detail-title">{selected.member.name}</h2>
            <p>{selected.status} · 最近参与 {selected.lastActive ?? "暂无记录"}</p>
            <dl>
              <div><dt>累计垫付</dt><dd>{formatMoney(selected.paid)}</dd></div>
              <div><dt>个人分摊</dt><dd>{formatMoney(selected.share)}</dd></div>
              <div><dt>参与账单</dt><dd>{selected.billCount} 笔</dd></div>
            </dl>
            <div className={selected.balance >= 0 ? "member-balance is-credit" : "member-balance is-debit"}>
              <span>{selected.balance >= 0 ? "当前应收回" : "当前应补款"}</span>
              <strong>{formatMoney(Math.abs(selected.balance))}</strong>
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
