import assert from "node:assert/strict";
import test from "node:test";

import { summarizeSpending } from "../src/data/demoData.js";

const bills = [
  { amount: 120, category: "餐饮", payer: 1 },
  { amount: 80, category: "餐饮", payer: 2 },
  { amount: 50, category: "交通", payer: 1 },
];

test("summarizeSpending calculates totals and average", () => {
  const summary = summarizeSpending(bills);

  assert.equal(summary.total, 250);
  assert.equal(summary.average, 250 / 3);
});

test("summarizeSpending orders categories and payers by amount", () => {
  const summary = summarizeSpending(bills);

  assert.deepEqual(
    summary.byCategory.map(({ name, amount, count }) => ({ name, amount, count })),
    [
      { name: "餐饮", amount: 200, count: 2 },
      { name: "交通", amount: 50, count: 1 },
    ],
  );
  assert.equal(summary.byPayer[0].name, "Maki");
  assert.equal(summary.byPayer[0].amount, 170);
});

test("summarizeSpending handles an empty month", () => {
  const summary = summarizeSpending([]);

  assert.equal(summary.total, 0);
  assert.equal(summary.average, 0);
  assert.deepEqual(summary.byCategory, []);
});
