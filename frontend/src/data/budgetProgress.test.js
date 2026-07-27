import assert from "node:assert/strict";
import test from "node:test";

import { summarizeBudgetProgress } from "./budgetProgress.js";


test("calculates usage against the persisted monthly budget", () => {
  assert.deepEqual(summarizeBudgetProgress(1200, 3600), {
    budget: 3600,
    percentage: 33,
    progress: 33.33333333333333,
  });
});


test("caps only the visual progress while retaining an over-budget percentage", () => {
  assert.deepEqual(summarizeBudgetProgress(3000, 2400), {
    budget: 2400,
    percentage: 125,
    progress: 100,
  });
});


test("falls back safely when an invalid budget reaches the view", () => {
  assert.deepEqual(summarizeBudgetProgress(100, 0), {
    budget: 2400,
    percentage: 4,
    progress: 4.166666666666666,
  });
});
