import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const consumers = [
  "src/pages/DashboardPage.jsx",
  "src/components/MembersView.jsx",
  "src/components/AdminUsersView.jsx",
];

test("all user-facing views use the shared UserAvatar component", () => {
  for (const path of consumers) {
    const source = readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
    assert.match(source, /import \{ UserAvatar \} from ["'][^"']+UserAvatar["'];/);
    assert.doesNotMatch(source, /function (?:Avatar|MemberAvatar|UserAvatar)\s*\(/);
  }
});
