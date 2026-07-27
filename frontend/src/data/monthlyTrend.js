function previousMonthPrefix(referenceDate) {
  const year = Number(referenceDate.slice(0, 4));
  const month = Number(referenceDate.slice(5, 7));
  const previousYear = month === 1 ? year - 1 : year;
  const previousMonth = month === 1 ? 12 : month - 1;
  return `${previousYear}-${String(previousMonth).padStart(2, "0")}`;
}

function totalForMonth(bills, monthPrefix) {
  return bills.reduce(
    (total, bill) => bill.date.slice(0, 7) === monthPrefix ? total + bill.amount : total,
    0,
  );
}

export function summarizeMonthlyTrend(bills, referenceDate) {
  const currentPrefix = referenceDate.slice(0, 7);
  const currentTotal = totalForMonth(bills, currentPrefix);
  const previousTotal = totalForMonth(bills, previousMonthPrefix(referenceDate));

  if (currentTotal === previousTotal) {
    return {
      currentTotal,
      previousTotal,
      direction: "flat",
      percentage: 0,
      label: "与上月持平",
    };
  }

  if (previousTotal === 0) {
    return {
      currentTotal,
      previousTotal,
      direction: "up",
      percentage: null,
      label: "上月无支出，本月新增",
    };
  }

  const direction = currentTotal > previousTotal ? "up" : "down";
  const percentage = Math.abs(currentTotal - previousTotal) / previousTotal * 100;
  return {
    currentTotal,
    previousTotal,
    direction,
    percentage,
    label: `比上月${direction === "up" ? "多" : "少"} ${percentage.toFixed(1)}%`,
  };
}
