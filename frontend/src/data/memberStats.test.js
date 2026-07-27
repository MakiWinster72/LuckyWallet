import assert from "node:assert/strict";
import test from "node:test";

import { initialBills, members } from "./demoData.js";
import { buildMemberStats, summarizeMembers } from "./memberStats.js";

test("buildMemberStats tracks each member's payments and participation", () => {
  const stats = buildMemberStats(members, initialBills);
  const maki = stats.find((item) => item.member.name === "Maki");

  assert.equal(stats.length, 5);
  assert.equal(maki.paid, 784);
  assert.equal(maki.billCount, 5);
  assert.equal(maki.lastActive, "2026-07-25");
  assert.equal(maki.status, "已加入");
});

test("balances across the whole household cancel each other out", () => {
  const stats = buildMemberStats(members, initialBills);
  const balance = stats.reduce((sum, item) => sum + item.balance, 0);

  assert.ok(Math.abs(balance) < 0.000001);
});

test("summarizeMembers exposes household totals", () => {
  const summary = summarizeMembers(buildMemberStats(members, initialBills));

  assert.equal(summary.active, 5);
  assert.equal(summary.paid, initialBills.reduce((sum, bill) => sum + bill.amount, 0));
  assert.ok(summary.positive > 0);
});
