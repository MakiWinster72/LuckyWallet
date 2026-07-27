function dateStringForLocalDay(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalDateString(date = new Date()) {
  return dateStringForLocalDay(date);
}

export function selectMonthlyBills(bills, referenceDate = getLocalDateString()) {
  const monthPrefix = referenceDate.slice(0, 7);
  return bills.filter((bill) => bill.date.slice(0, 7) === monthPrefix);
}

export function summarizeMonthlyBills(bills, referenceDate = getLocalDateString()) {
  const monthlyBills = selectMonthlyBills(bills, referenceDate);
  return {
    bills: monthlyBills,
    count: monthlyBills.length,
    total: monthlyBills.reduce((sum, bill) => sum + bill.amount, 0),
  };
}

export function getChineseMonthLabel(referenceDate = getLocalDateString()) {
  return `${Number(referenceDate.slice(5, 7))}月`;
}
