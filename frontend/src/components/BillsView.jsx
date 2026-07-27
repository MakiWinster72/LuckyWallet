import { useMemo, useState } from "react";

import { AppIcon } from "./AppIcon";
import { filterBills } from "../data/billFilters";
import { categories, getCategory } from "../data/categories";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, paginate } from "../data/pagination";
import { formatMoney } from "../utils/money";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "short",
  day: "numeric",
});
const rangeDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatRange(startDate, endDate) {
  if (!startDate && !endDate) return "全部日期";
  const start = startDate ? rangeDateFormatter.format(new Date(`${startDate}T00:00:00`)) : "最早";
  const end = endDate ? rangeDateFormatter.format(new Date(`${endDate}T00:00:00`)) : "至今";
  return `${start} – ${end}`;
}

function BillRegister({ bills, members, rangeLabel, dateError, onAdd, onOpen }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const pagination = paginate(bills, page, pageSize);
  const visibleTotal = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const memberIndex = new Map(members.map((member) => [member.id, member]));

  return (
    <div className="bill-register panel">
      <header>
        <div><strong>{bills.length} 笔账单</strong><span>{dateError ? "请修正日期范围" : rangeLabel}</span></div>
        <div><span>筛选结果合计</span><strong>{formatMoney(visibleTotal)}</strong></div>
      </header>
      {dateError ? (
        <div className="bill-empty"><span>日期范围无效</span><p>请先修正开始日期和结束日期，再查看筛选结果。</p></div>
      ) : bills.length ? (
        <>
          <div className="bill-table-scroll">
            <table>
              <thead><tr><th scope="col">账单</th><th scope="col">日期</th><th scope="col">付款人</th><th scope="col">参与</th><th scope="col">金额</th><th scope="col"><span className="sr-only">操作</span></th></tr></thead>
              <tbody>
                {pagination.items.map((bill) => {
                  const item = getCategory(bill.category);
                  return (
                    <tr key={bill.id}>
                      <td><span className="category-icon" style={{ "--category": item.color }}>{item.icon}</span><span><strong>{bill.title}</strong><small>{bill.category}</small></span></td>
                      <td>{dateFormatter.format(new Date(`${bill.date}T00:00:00`))}</td>
                      <td>{memberIndex.get(bill.payer)?.name ?? "未知"}</td>
                      <td>{bill.participants.length} 人</td>
                      <td>{formatMoney(bill.amount)}</td>
                      <td><button className="row-action" type="button" onClick={() => onOpen(bill)} aria-label={`查看${bill.title}`}><AppIcon name="arrow" size={17} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <nav className="bill-pagination" aria-label="账单分页">
            <span aria-live="polite">第 {pagination.start}–{pagination.end} 条，共 {bills.length} 条</span>
            <label>每页
              <select aria-label="每页账单数量" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
                {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} 条</option>)}
              </select>
            </label>
            <div>
              <button type="button" onClick={() => setPage(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} aria-label="上一页">上一页</button>
              {Array.from({ length: pagination.pageCount }, (_, index) => index + 1).map((pageNumber) => (
                <button key={pageNumber} type="button" aria-label={`第 ${pageNumber} 页`} aria-current={pagination.currentPage === pageNumber ? "page" : undefined} onClick={() => setPage(pageNumber)}>{pageNumber}</button>
              ))}
              <button type="button" onClick={() => setPage(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.pageCount} aria-label="下一页">下一页</button>
            </div>
          </nav>
        </>
      ) : <div className="bill-empty"><span>没有符合条件的账单</span><p>调整筛选条件，或新增本账期的第一笔消费。</p><button type="button" onClick={onAdd}>新增账单</button></div>}
    </div>
  );
}

export function BillsView({ bills, members, query, onAdd, onOpen }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [payerId, setPayerId] = useState("");
  const dateError = startDate && endDate && startDate > endDate
    ? "开始日期不能晚于结束日期"
    : "";
  const visibleBills = useMemo(
    () => dateError ? [] : filterBills(bills, {
      startDate,
      endDate,
      category,
      payerId,
      query,
    }),
    [bills, category, dateError, endDate, payerId, query, startDate],
  );
  const filterKey = `${startDate}:${endDate}:${category}:${payerId}:${query}`;

  return (
    <section className="bills-view" aria-labelledby="bills-title">
      <header className="bills-heading">
        <div>
          <span className="overline">ALL ENTRIES</span>
          <h2 id="bills-title">全部账单</h2>
          <p>筛选、核对并查看每一笔共同消费。</p>
        </div>
        <button className="add-button" type="button" onClick={onAdd}>
          <AppIcon name="plus" size={18} />新增账单
        </button>
      </header>

      <div className="bill-filters" aria-label="筛选账单">
        <div className="date-range-fields">
          <label>开始日期<input name="bill-start-date" type="date" value={startDate} max={endDate || undefined} aria-describedby={dateError ? "bill-date-error" : undefined} aria-invalid={Boolean(dateError)} onChange={(event) => setStartDate(event.target.value)} /></label>
          <label>结束日期<input name="bill-end-date" type="date" value={endDate} min={startDate || undefined} aria-describedby={dateError ? "bill-date-error" : undefined} aria-invalid={Boolean(dateError)} onChange={(event) => setEndDate(event.target.value)} /></label>
          {dateError && <span className="filter-error" id="bill-date-error" role="alert">{dateError}</span>}
        </div>
        <label>分类<select name="bill-category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">全部分类</option>
          {Object.keys(categories).map((name) => <option key={name} value={name}>{name}</option>)}
        </select></label>
        <label>付款人<select name="bill-payer" value={payerId} onChange={(event) => setPayerId(event.target.value)}>
          <option value="">全部成员</option>
          {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
        </select></label>
        <button className="clear-filter" type="button" onClick={() => { setStartDate(""); setEndDate(""); setCategory(""); setPayerId(""); }}>清除筛选</button>
      </div>

      <BillRegister
        key={filterKey}
        bills={visibleBills}
        members={members}
        rangeLabel={formatRange(startDate, endDate)}
        dateError={dateError}
        onAdd={onAdd}
        onOpen={onOpen}
      />
    </section>
  );
}
