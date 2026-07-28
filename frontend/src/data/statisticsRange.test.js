import assert from "node:assert/strict";
import test from "node:test";

import {
  availableStatisticsYears,
  filterStatisticsBills,
  selectExportBills,
} from "./statisticsRange.js";

const bills = [
  { id: 1, date: "2025-12-31" },
  { id: 2, date: "2026-01-01" },
  { id: 3, date: "2026-07-12" },
  { id: 4, date: "2026-07-27" },
];

test("switches statistics between a selected month and year", () => {
  assert.deepEqual(
    filterStatisticsBills(bills, { mode: "month", month: "2026-07", year: "2026" }).map((bill) => bill.id),
    [3, 4],
  );
  assert.deepEqual(
    filterStatisticsBills(bills, { mode: "year", month: "2026-07", year: "2026" }).map((bill) => bill.id),
    [2, 3, 4],
  );
});

test("lists data years newest first and keeps the current fallback year", () => {
  assert.deepEqual(availableStatisticsYears(bills, "2027"), ["2027", "2026", "2025"]);
});

test("selects current, custom, and all export ranges", () => {
  const current = bills.slice(2);
  assert.deepEqual(selectExportBills(bills, current, { range: "current" }).map((bill) => bill.id), [3, 4]);
  assert.deepEqual(
    selectExportBills(bills, current, { range: "custom", startDate: "2026-01-01", endDate: "2026-07-12" }).map((bill) => bill.id),
    [2, 3],
  );
  assert.equal(selectExportBills(bills, current, { range: "all" }).length, 4);
});
