import assert from "node:assert/strict";
import test from "node:test";

import { selectMonthlyBills, summarizeMonthlyBills } from "./monthlyBills.js";

const mixedBills = [
  { id: 1, amount: 120, date: "2026-05-31" },
  { id: 2, amount: 80.5, date: "2026-06-30" },
  { id: 3, amount: 240, date: "2026-07-01" },
  { id: 4, amount: 59.9, date: "2026-07-27" },
];

test("selects only bills from the month represented by a date string", () => {
  assert.deepEqual(
    selectMonthlyBills(mixedBills, "2026-07-26").map((bill) => bill.id),
    [3, 4],
  );
});

test("summarizes the current month without including prior months", () => {
  assert.deepEqual(summarizeMonthlyBills(mixedBills, "2026-07-26"), {
    bills: [mixedBills[2], mixedBills[3]],
    count: 2,
    total: 299.9,
  });
});

test("matches date prefixes without parsing UTC timestamps", () => {
  assert.deepEqual(
    selectMonthlyBills(
      [{ id: 5, amount: 10, date: "2026-07-01" }],
      "2026-07-31",
    ).map((bill) => bill.id),
    [5],
  );
});
