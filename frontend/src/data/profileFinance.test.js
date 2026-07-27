import assert from "node:assert/strict";
import test from "node:test";

import { summarizeProfileFinance } from "./profileFinance.js";

const bills = [
  { amount: 120, payer: 1, participants: [1, 2, 3], date: "2026-07-06" },
  { amount: 80, payer: 2, participants: [1, 2], date: "2026-07-12" },
  { amount: 60, payer: 1, participants: [1, 2], date: "2026-06-28" },
];

test("summarizes the current user's payments and shares across all bills", () => {
  const summary = summarizeProfileFinance(bills, 1);

  assert.equal(summary.paid, 180);
  assert.equal(summary.share, 110);
  assert.equal(summary.totalExpense, 260);
  assert.equal(summary.paidRatio, (180 / 260) * 100);
  assert.equal(summary.shareRatio, (110 / 260) * 100);
});

test("matches member ids consistently and uses total expense for both ratios", () => {
  const summary = summarizeProfileFinance(bills, "2");

  assert.equal(summary.paid, 80);
  assert.equal(summary.share, 110);
  assert.equal(summary.paidRatio, (80 / 260) * 100);
  assert.equal(summary.shareRatio, (110 / 260) * 100);
});

test("returns safe zero values for empty data and zero-share bills", () => {
  assert.deepEqual(
    summarizeProfileFinance([{ amount: 50, payer: 1, participants: [] }], 2),
    {
      paid: 0,
      paidRatio: 0,
      share: 0,
      shareRatio: 0,
      totalExpense: 50,
    },
  );
  assert.deepEqual(summarizeProfileFinance([], 1), {
    paid: 0,
    paidRatio: 0,
    share: 0,
    shareRatio: 0,
    totalExpense: 0,
  });
});
