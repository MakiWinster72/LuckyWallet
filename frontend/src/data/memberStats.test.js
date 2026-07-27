import assert from "node:assert/strict";
import test from "node:test";

import { buildMemberStats, summarizeMembers } from "./memberStats.js";

const members = [
  { id: 10, name: "Lucky" },
  { id: 11, name: "Anna" },
];
const bills = [
  { amount: 90, payer: 10, participants: [10, 11, 999], date: "2026-07-20" },
];

test("buildMemberStats uses API members and ignores unknown bill participants", () => {
  const stats = buildMemberStats(members, bills);
  assert.equal(stats.length, 2);
  assert.equal(stats[0].paid, 90);
  assert.equal(stats[1].share, 30);
});

test("member summaries handle an empty household", () => {
  assert.deepEqual(summarizeMembers(buildMemberStats([], bills)), {
    paid: 0, positive: 0, active: 0,
  });
});

test("zero-participant bills do not produce invalid balances", () => {
  const [stat] = buildMemberStats([members[0]], [
    { amount: 20, payer: 10, participants: [], date: "2026-07-21" },
  ]);
  assert.equal(stat.share, 0);
  assert.equal(stat.balance, 20);
});
