import assert from "node:assert/strict";
import test from "node:test";

import {
  adaptAdminUserFromApi,
  adaptAdminUserUpdateToApi,
  adaptNewAdminUserToApi,
  filterAdminUsers,
} from "./admin-user-adapter.js";

const apiUser = {
  id: "7",
  username: "anna",
  nickname: null,
  role: "user",
  is_active: true,
  created_at: "2026-07-27T13:28:00Z",
};

test("adapts API users for the admin workspace", () => {
  assert.deepEqual(adaptAdminUserFromApi(apiUser), {
    id: 7,
    username: "anna",
    nickname: "",
    role: "user",
    isActive: true,
    createdAt: "2026-07-27T13:28:00Z",
  });
});

test("normalizes create and update payloads", () => {
  assert.deepEqual(adaptNewAdminUserToApi({
    username: " lucky ",
    nickname: " Lucky ",
    password: "test-password",
    role: "admin",
  }), {
    username: "lucky",
    nickname: "Lucky",
    password: "test-password",
    role: "admin",
  });
  assert.deepEqual(adaptAdminUserUpdateToApi({
    nickname: " Anna ",
    role: "user",
    isActive: false,
  }), {
    nickname: "Anna",
    role: "user",
    is_active: false,
  });
});

test("filters users by query, role, and status", () => {
  const users = [
    adaptAdminUserFromApi(apiUser),
    adaptAdminUserFromApi({ ...apiUser, id: 8, username: "maki", nickname: "Maki", role: "admin", is_active: false }),
  ];

  assert.deepEqual(
    filterAdminUsers(users, { query: "Maki", role: "admin", status: "inactive" }).map((user) => user.id),
    [8],
  );
});
