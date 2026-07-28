export function filterStatisticsBills(bills, selection) {
  const prefix = selection.mode === "year" ? selection.year : selection.month;
  return bills.filter((bill) => bill.date?.startsWith(prefix));
}

export function availableStatisticsYears(bills, fallbackYear) {
  const years = new Set([String(fallbackYear)]);
  for (const bill of bills) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(bill.date ?? "")) years.add(bill.date.slice(0, 4));
  }
  return [...years].sort((left, right) => right.localeCompare(left));
}

export function selectExportBills(bills, currentBills, options) {
  if (options.range === "all") return bills;
  if (options.range === "custom") {
    return bills.filter((bill) => (
      (!options.startDate || bill.date >= options.startDate)
      && (!options.endDate || bill.date <= options.endDate)
    ));
  }
  return currentBills;
}
