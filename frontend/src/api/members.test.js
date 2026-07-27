import assert from "node:assert/strict";
import test from "node:test";

import { adaptMemberFromApi } from "./member-adapter.js";

test("member adapter exposes a display model without role data", () => {
  const member = adaptMemberFromApi({
    id: 1, username: "lucky", nickname: "Lucky", role: "admin",
  });
  assert.deepEqual(member, {
    id: 1, username: "lucky", name: "Lucky", initials: "LU", color: "#704264",
  });
  assert.equal("role" in member, false);
});
