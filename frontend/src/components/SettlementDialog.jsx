import { useMemo } from "react";

import { createSettlementPlan } from "../data/settlementPlan";
import { formatMoney } from "../utils/money";
import { AppIcon } from "./AppIcon";

function Initials({ name }) {
  return <span className="settlement-avatar" aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>;
}

export function SettlementDialog({ bills, members, onClose }) {
  const plan = useMemo(() => createSettlementPlan(bills, members), [bills, members]);

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="settlement-dialog" role="dialog" aria-modal="true" aria-labelledby="settlement-title">
        <header>
          <div><span className="overline">SETTLEMENT PLAN</span><h2 id="settlement-title">结算方案</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭">×</button>
        </header>

        {plan.transfers.length ? <>
          <div className="settlement-summary">
            <span>合并 {bills.length} 笔账单后</span>
            <strong>{plan.transfers.length} 笔转账即可结清</strong>
            <small>建议转账总额 {formatMoney(plan.total)}</small>
          </div>
          <ol className="settlement-list">
            {plan.transfers.map((transfer, index) => (
              <li key={`${transfer.fromId}-${transfer.toId}-${index}`}>
                <Initials name={transfer.fromName} />
                <div>
                  <strong>{transfer.fromName}</strong>
                  <span>转给 <b>{transfer.toName}</b></span>
                </div>
                <AppIcon name="arrow" size={17} />
                <strong>{formatMoney(transfer.amount)}</strong>
              </li>
            ))}
          </ol>
        </> : <div className="settlement-empty">
          <span aria-hidden="true">✓</span>
          <h3>现在不需要结算</h3>
          <p>成员之间的付款与分摊已经平衡，新增共同账单后会自动重新计算。</p>
        </div>}

        <footer>
          <p><AppIcon name="info" size={15} />这是依据现有账单生成的转账建议，不会自动付款或标记结清。</p>
          <button className="add-button" type="button" onClick={onClose}>知道了</button>
        </footer>
      </section>
    </div>
  );
}
