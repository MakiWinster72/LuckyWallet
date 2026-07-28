import assert from "node:assert/strict";
import test from "node:test";

import { buildStatisticsCsv } from "./statisticsExport.js";

test("exports the selected month summary and escaped bill details", () => {
  const csv = buildStatisticsCsv({
    month: "2026-07",
    bills: [{
      date: "2026-07-03",
      title: "聚餐, 烧烤",
      category: "餐饮",
      payer: 2,
      amount: 88.5,
      participants: [1, 2],
      note: "他说\"下次再来\"",
    }],
    members: [{ id: 2, name: "Lucky" }],
  });

  assert.ok(csv.startsWith("\uFEFFLuckyWallet 支出统计"));
  assert.match(csv, /统计月份,2026-07/);
  assert.match(csv, /总支出,88.50/);
  assert.match(csv, /"聚餐, 烧烤"/);
  assert.match(csv, /"他说""下次再来"""/);
  assert.match(csv, /Lucky,88.50,2/);
});

test("exports a useful empty report", () => {
  const csv = buildStatisticsCsv({ month: "2026-07", bills: [], members: [] });

  assert.match(csv, /账单笔数,0/);
  assert.match(csv, /日期,账单名称,分类,付款人,金额,参与人数,备注/);
});
