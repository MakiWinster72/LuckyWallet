import assert from "node:assert/strict";
import test from "node:test";

import { createSettlementPlan } from "./settlementPlan.js";

test("归并多人账单为净额转账建议", () => {
  const plan = createSettlementPlan([
    { amount: 90, payer: 1, participants: [1, 2, 3] },
    { amount: 30, payer: 2, participants: [1, 2, 3] },
  ], [
    { id: 1, name: "Maki" },
    { id: 2, name: "Lucky" },
    { id: 3, name: "Ula" },
  ]);

  assert.deepEqual(plan.transfers, [
    { fromId: 3, fromName: "Ula", toId: 1, toName: "Maki", amount: 40 },
    { fromId: 2, fromName: "Lucky", toId: 1, toName: "Maki", amount: 10 },
  ]);
  assert.equal(plan.total, 50);
});

test("已平衡账目不生成结算建议", () => {
  const plan = createSettlementPlan([
    { amount: 20, payer: 1, participants: [1, 2] },
    { amount: 20, payer: 2, participants: [1, 2] },
  ], [{ id: 1, name: "A" }, { id: 2, name: "B" }]);

  assert.deepEqual(plan.transfers, []);
  assert.equal(plan.total, 0);
});

test("未知成员仍参与净额归并并显示安全名称", () => {
  const plan = createSettlementPlan(
    [{ amount: 12, payer: 99, participants: [1, 99] }],
    [{ id: 1, name: "Maki" }],
  );

  assert.deepEqual(plan.transfers, [{
    fromId: 1,
    fromName: "Maki",
    toId: 99,
    toName: "未知成员 #99",
    amount: 6,
  }]);
});

test("按分精确分摊，余数不会在浮点运算中丢失", () => {
  const plan = createSettlementPlan(
    [{ amount: 10, payer: 1, participants: [1, 2, 3] }],
    [{ id: 1, name: "A" }, { id: 2, name: "B" }, { id: 3, name: "C" }],
  );

  assert.equal(plan.transfers.reduce((sum, item) => sum + item.amount, 0), 6.66);
  assert.equal(
    plan.balances.reduce((sum, item) => sum + Math.round(item.balance * 100), 0),
    0,
  );
});
