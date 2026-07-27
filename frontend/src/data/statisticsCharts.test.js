import assert from "node:assert/strict";
import test from "node:test";

import { buildDailySeries, buildMonthlySeries, buildSmoothSvgPath } from "./statisticsCharts.js";

const bills = [
  { amount: 80, date: "2026-07-03" },
  { amount: 20, date: "2026-07-03" },
  { amount: 50, date: "2026-06-20" },
  { amount: 30, date: "2026-02-10" },
  { amount: 999, date: "2025-12-01" },
];

test("builds six chronological month buckets ending at the reference month", () => {
  const series = buildMonthlySeries(bills, "2026-07-27");

  assert.deepEqual(series.map((item) => item.month), [
    "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07",
  ]);
  assert.deepEqual(series.map((item) => item.total), [30, 0, 0, 0, 50, 100]);
});

test("builds every local calendar day and combines bills on the same date", () => {
  const series = buildDailySeries(bills, "2026-07-27");

  assert.equal(series.length, 31);
  assert.deepEqual(series[2], { day: 3, date: "2026-07-03", total: 100 });
  assert.equal(series[30].date, "2026-07-31");
});

test("handles a leap-year February without parsing dates as UTC", () => {
  assert.equal(buildDailySeries([], "2024-02-15").length, 29);
});

test("creates a smooth cubic path that still reaches every endpoint", () => {
  const path = buildSmoothSvgPath([
    { x: 0, y: 10 },
    { x: 20, y: 30 },
    { x: 40, y: 15 },
  ]);

  assert.ok(path.startsWith("M 0 10 C"));
  assert.equal((path.match(/ C /g) ?? []).length, 2);
  assert.ok(path.endsWith("40 15"));
  assert.equal(buildSmoothSvgPath([]), "");
});
