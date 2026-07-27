import assert from "node:assert/strict";
import test from "node:test";

import { adaptBillFromApi, adaptBillToApi } from "./bill-adapter.js";

test("adaptBillFromApi converts decimals and participant objects", () => {
  assert.deepEqual(adaptBillFromApi({
    id: 8,
    title: "周末火锅",
    amount: "328.00",
    category: { id: 1, name: "餐饮", icon: "restaurant" },
    payer_id: 2,
    participants: [{ user_id: 1 }, { user_id: 2 }],
    bill_date: "2026-07-25",
    note: null,
  }), {
    id: 8,
    title: "周末火锅",
    amount: 328,
    category: "餐饮",
    payer: 2,
    participants: [1, 2],
    date: "2026-07-25",
    note: "",
  });
});

test("adaptBillToApi maps form fields to the backend contract", () => {
  assert.deepEqual(adaptBillToApi({
    title: "超市补给",
    amount: "186.50",
    category: "日用品",
    payer: "3",
    participants: [1, 3, 5],
    date: "2026-07-24",
    note: "",
  }), {
    title: "超市补给",
    amount: 186.5,
    payer_id: 3,
    bill_date: "2026-07-24",
    category_id: 3,
    participant_ids: [1, 3, 5],
    note: null,
  });
});
