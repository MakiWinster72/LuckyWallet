export function filterBills(bills, { month, category, payerId, query }) {
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  return bills.filter((bill) => (
    (!month || bill.date.startsWith(month))
    && (!category || bill.category === category)
    && (!payerId || bill.payer === Number(payerId))
    && (!normalizedQuery
      || bill.title.toLocaleLowerCase("zh-CN").includes(normalizedQuery)
      || bill.category.toLocaleLowerCase("zh-CN").includes(normalizedQuery))
  ));
}
