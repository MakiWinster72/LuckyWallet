import test from "node:test";
import assert from "node:assert/strict";

import { summarizePendingSettlement } from "../src/data/settlementSummary.js";

test("summarizePendingSettlement returns zero when there are no bills", () => {
  assert.deepEqual(summarizePendingSettlement([], 1), { amount: 0, count: 0 });
});

test("summarizePendingSettlement counts only bills another member paid", () => {
  const bills = [
    { amount: 90, payer: 1, participants: [1, 2, 3] },
    { amount: 120, payer: 2, participants: [1, 2, 3] },
    { amount: 80, payer: 3, participants: [2, 3] },
  ];

  assert.deepEqual(summarizePendingSettlement(bills, 1), { amount: 40, count: 1 });
});

test("summarizePendingSettlement tolerates unknown users and empty participants", () => {
  const bills = [
    { amount: 50, payer: 2, participants: [] },
    { amount: 75, payer: 2, participants: [2, 3] },
  ];

  assert.deepEqual(summarizePendingSettlement(bills, 99), { amount: 0, count: 0 });
});
