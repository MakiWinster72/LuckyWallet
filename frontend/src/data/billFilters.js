export function filterBills(bills, {
  month,
  startDate,
  endDate,
  category,
  payerId,
  query,
}) {
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  return bills.filter((bill) => (
    (!month || bill.date.startsWith(month))
    && (!startDate || bill.date >= startDate)
    && (!endDate || bill.date <= endDate)
    && (!category || bill.category === category)
    && (!payerId || bill.payer === Number(payerId))
    && (!normalizedQuery
      || bill.title.toLocaleLowerCase("zh-CN").includes(normalizedQuery)
      || bill.category.toLocaleLowerCase("zh-CN").includes(normalizedQuery))
  ));
}
