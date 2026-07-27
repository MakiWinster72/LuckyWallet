import assert from "node:assert/strict";
import test from "node:test";

import { filterBills } from "./billFilters.js";

const bills = [
  { id: 1, title: "周末火锅", date: "2026-07-25", category: "餐饮", payer: 1 },
  { id: 2, title: "超市补给", date: "2026-07-24", category: "日用品", payer: 3 },
  { id: 3, title: "六月聚餐", date: "2026-06-28", category: "餐饮", payer: 1 },
];
const members = [
  { id: 1, name: "MakiWinster" },
  { id: 3, name: "Anna" },
];

test("filterBills combines month, category and payer filters", () => {
  assert.deepEqual(
    filterBills(bills, { month: "2026-07", category: "餐饮", payerId: "1", query: "" }).map((bill) => bill.id),
    [1],
  );
});

test("filterBills searches bill titles and categories", () => {
  assert.deepEqual(
    filterBills(bills, { month: "", category: "", payerId: "", query: "补给" }).map((bill) => bill.id),
    [2],
  );
  assert.deepEqual(
    filterBills(bills, { month: "", category: "", payerId: "", query: "餐饮" }).map((bill) => bill.id),
    [1, 3],
  );
});

test("filterBills searches payer names without matching unrelated members", () => {
  assert.deepEqual(
    filterBills(bills, {
      month: "", category: "", payerId: "", query: "anna", members,
    }).map((bill) => bill.id),
    [2],
  );
  assert.deepEqual(
    filterBills(bills, {
      month: "", category: "", payerId: "", query: "lucky", members,
    }),
    [],
  );
});

test("filterBills returns an empty result when filters do not match", () => {
  assert.deepEqual(
    filterBills(bills, { month: "2025-01", category: "", payerId: "", query: "" }),
    [],
  );
});

test("filterBills includes both date range boundaries", () => {
  assert.deepEqual(
    filterBills(bills, {
      month: "",
      startDate: "2026-06-28",
      endDate: "2026-07-24",
      category: "",
      payerId: "",
      query: "",
    }).map((bill) => bill.id),
    [2, 3],
  );
});

test("filterBills supports open-ended date ranges", () => {
  assert.deepEqual(
    filterBills(bills, {
      month: "",
      startDate: "2026-07-24",
      endDate: "",
      category: "",
      payerId: "",
      query: "",
    }).map((bill) => bill.id),
    [1, 2],
  );
  assert.deepEqual(
    filterBills(bills, {
      month: "",
      startDate: "",
      endDate: "2026-06-28",
      category: "",
      payerId: "",
      query: "",
    }).map((bill) => bill.id),
    [3],
  );
});
