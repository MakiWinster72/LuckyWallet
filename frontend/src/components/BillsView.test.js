import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./BillsView.jsx", import.meta.url), "utf8");

test("bill search keeps the register mounted while pagination resets", () => {
  assert.doesNotMatch(
    source,
    /<BillRegister\s+key=/,
    "keying BillRegister by query remounts the search input and drops focus",
  );
  assert.match(source, /function setQuery\(nextQuery\) \{\s+setPage\(1\)/);
});
