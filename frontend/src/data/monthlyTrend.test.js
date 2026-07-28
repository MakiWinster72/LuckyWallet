import assert from "node:assert/strict";
import test from "node:test";

import { summarizeMonthlyTrend } from "./monthlyTrend.js";

function bill(id, date, amount) {
  return { id, date, amount };
}

test("reports a real increase from the previous month", () => {
  assert.deepEqual(
    summarizeMonthlyTrend([
      bill(1, "2026-06-30", 200),
      bill(2, "2026-07-01", 250),
    ], "2026-07-27"),
    {
      currentTotal: 250,
      previousTotal: 200,
      direction: "up",
      percentage: 25,
      label: "比上月多 25.0%",
    },
  );
});

test("reports decrease and unchanged spending without a fixed direction", () => {
  assert.equal(
    summarizeMonthlyTrend([
      bill(1, "2026-06-02", 400),
      bill(2, "2026-07-02", 300),
    ], "2026-07-27").label,
    "比上月少 25.0%",
  );
  assert.deepEqual(
    summarizeMonthlyTrend([
      bill(1, "2026-06-02", 300),
      bill(2, "2026-07-02", 300),
    ], "2026-07-27"),
    {
      currentTotal: 300,
      previousTotal: 300,
      direction: "flat",
      percentage: 0,
      label: "与上月持平",
    },
  );
});

test("handles a zero previous month and two empty months", () => {
  assert.deepEqual(
    summarizeMonthlyTrend([bill(1, "2026-07-02", 80)], "2026-07-27"),
    {
      currentTotal: 80,
      previousTotal: 0,
      direction: "up",
      percentage: null,
      label: "上月无支出，本月新增",
    },
  );
  assert.deepEqual(
    summarizeMonthlyTrend([], "2026-07-27"),
    {
      currentTotal: 0,
      previousTotal: 0,
      direction: "flat",
      percentage: 0,
      label: "与上月持平",
    },
  );
});

test("uses local YYYY-MM boundaries across a year change", () => {
  const trend = summarizeMonthlyTrend([
    bill(1, "2025-12-31", 100),
    bill(2, "2026-01-01", 50),
    bill(3, "2026-02-01", 999),
  ], "2026-01-15");

  assert.equal(trend.currentTotal, 50);
  assert.equal(trend.previousTotal, 100);
  assert.equal(trend.label, "比上月少 50.0%");
});
