export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function getPageCount(totalItems, pageSize = DEFAULT_PAGE_SIZE) {
  if (totalItems <= 0) return 0;
  return Math.ceil(totalItems / Math.max(1, pageSize));
}

export function clampPage(page, totalItems, pageSize = DEFAULT_PAGE_SIZE) {
  const pageCount = getPageCount(totalItems, pageSize);
  if (!pageCount) return 1;
  return Math.min(Math.max(1, Number(page) || 1), pageCount);
}

export function paginate(items, page, pageSize = DEFAULT_PAGE_SIZE) {
  const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const currentPage = clampPage(page, items.length, safePageSize);
  const startIndex = (currentPage - 1) * safePageSize;
  const endIndex = Math.min(startIndex + safePageSize, items.length);

  return {
    currentPage,
    pageCount: getPageCount(items.length, safePageSize),
    start: items.length ? startIndex + 1 : 0,
    end: endIndex,
    items: items.slice(startIndex, endIndex),
  };
}
