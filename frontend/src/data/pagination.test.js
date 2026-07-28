import assert from "node:assert/strict";
import test from "node:test";

import { clampPage, getPageCount, paginate } from "./pagination.js";

test("calculates pages and returns the requested slice", () => {
  const result = paginate(Array.from({ length: 23 }, (_, index) => index + 1), 2, 10);

  assert.equal(getPageCount(23, 10), 3);
  assert.deepEqual(result.items, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  assert.deepEqual({ start: result.start, end: result.end }, { start: 11, end: 20 });
});

test("clamps an invalid page after the result count changes", () => {
  assert.equal(clampPage(5, 12, 10), 2);
  assert.equal(paginate([1, 2], 4, 10).currentPage, 1);
});

test("handles an empty collection without an invalid range", () => {
  assert.deepEqual(paginate([], 3, 10), {
    currentPage: 1,
    pageCount: 0,
    start: 0,
    end: 0,
    items: [],
  });
});
