import assert from "node:assert/strict";
import test from "node:test";

import { summarizeMemberFinance } from "./memberFinance.js";

const bills = [
  { amount: 120, payer: 1, participants: [1, 2, 3], date: "2026-07-03" },
  { amount: 80, payer: 2, participants: [1, 2], date: "2026-07-12" },
  { amount: 60, payer: 1, participants: [2, 3], date: "2026-06-10" },
  { amount: 30, payer: 1, participants: [1], date: "2025-12-10" },
];

test("calculates personal expense and reimbursement income from shared bills", () => {
  const summary = summarizeMemberFinance(bills, 1, "2026-07-27");

  assert.equal(summary.expense, 110);
  assert.equal(summary.income, 140);
  assert.equal(summary.net, 30);
});

test("builds six monthly expense and income buckets for the member curve", () => {
  const series = summarizeMemberFinance(bills, "1", "2026-07-27").series;

  assert.deepEqual(series.map((item) => item.month), [
    "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07",
  ]);
  assert.deepEqual(series.map((item) => item.expense), [0, 0, 0, 0, 0, 80]);
  assert.deepEqual(series.map((item) => item.income), [0, 0, 0, 0, 60, 80]);
});

test("returns safe zero values for an inactive or unknown member", () => {
  const summary = summarizeMemberFinance([], 99, "2026-07-27");

  assert.equal(summary.expense, 0);
  assert.equal(summary.income, 0);
  assert.equal(summary.net, 0);
  assert.equal(summary.series.length, 6);
});
