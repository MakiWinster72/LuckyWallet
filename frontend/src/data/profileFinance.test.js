import assert from "node:assert/strict";
import test from "node:test";

import { summarizeProfileFinance } from "./profileFinance.js";

const bills = [
  { amount: 120, payer: 1, participants: [1, 2, 3], date: "2026-07-06" },
  { amount: 80, payer: 2, participants: [1, 2], date: "2026-07-12" },
  { amount: 60, payer: 1, participants: [1, 2], date: "2026-06-28" },
];

test("summarizes the current user's monthly payments and equal shares", () => {
  assert.deepEqual(summarizeProfileFinance(bills, 1, "2026-07-27"), {
    paid: 120,
    paidRatio: 60,
    share: 80,
    shareRatio: 40,
    householdPaid: 200,
    householdShare: 200,
  });
});

test("matches member ids consistently and ignores bills outside the month", () => {
  const summary = summarizeProfileFinance(bills, "2", "2026-07-27");

  assert.equal(summary.paid, 80);
  assert.equal(summary.share, 80);
  assert.equal(summary.paidRatio, 40);
  assert.equal(summary.shareRatio, 40);
});

test("returns safe zero values for empty data and zero-share bills", () => {
  assert.deepEqual(
    summarizeProfileFinance(
      [{ amount: 50, payer: 1, participants: [], date: "2026-07-10" }],
      2,
      "2026-07-27",
    ),
    {
      paid: 0,
      paidRatio: 0,
      share: 0,
      shareRatio: 0,
      householdPaid: 50,
      householdShare: 0,
    },
  );
  assert.deepEqual(summarizeProfileFinance([], 1, "2026-07-27"), {
    paid: 0,
    paidRatio: 0,
    share: 0,
    shareRatio: 0,
    householdPaid: 0,
    householdShare: 0,
  });
});
