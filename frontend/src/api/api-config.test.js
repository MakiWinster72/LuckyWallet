import assert from "node:assert/strict";
import test from "node:test";

import { resolveApiBaseUrl } from "./api-config.js";

test("development uses the local API path when no base URL is configured", () => {
  assert.equal(resolveApiBaseUrl(undefined, true), "/api/v1");
});

test("production refuses to start authentication without an API base URL", () => {
  assert.throws(
    () => resolveApiBaseUrl(undefined, false),
    /VITE_API_BASE_URL/,
  );
});

test("an explicitly configured API base URL takes precedence", () => {
  assert.equal(
    resolveApiBaseUrl("https://wallet.example/api/v1", true),
    "https://wallet.example/api/v1",
  );
});

test("LAN clients use the same-origin API instead of their own localhost", () => {
  const originalWindow = globalThis.window;
  globalThis.window = { location: { origin: "http://192.168.1.20", hostname: "192.168.1.20" } };
  assert.equal(resolveApiBaseUrl("http://127.0.0.1:8000/api/v1", false), "/api/v1");
  globalThis.window = originalWindow;
});
