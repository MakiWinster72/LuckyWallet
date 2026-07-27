import { categories } from "./categories.js";

export function summarizeSpending(bills, members) {
  const byCategory = Object.keys(categories).map((name) => ({
    name, amount: 0, count: 0, ...categories[name],
  }));
  const categoryIndex = new Map(byCategory.map((item) => [item.name, item]));
  const byPayer = new Map(members.map((member) => [member.id, 0]));
  let total = 0;
  for (const bill of bills) {
    total += bill.amount;
    const category = categoryIndex.get(bill.category);
    if (category) {
      category.amount += bill.amount;
      category.count += 1;
    }
    byPayer.set(bill.payer, (byPayer.get(bill.payer) ?? 0) + bill.amount);
  }
  return {
    total,
    average: bills.length ? total / bills.length : 0,
    byCategory: byCategory.filter((item) => item.count > 0).sort((a, b) => b.amount - a.amount),
    byPayer: members.map((member) => ({ ...member, amount: byPayer.get(member.id) ?? 0 }))
      .sort((a, b) => b.amount - a.amount),
  };
}
