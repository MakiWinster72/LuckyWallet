export const members = [
  { id: 1, name: "Maki", initials: "MK", color: "#704264" },
  { id: 2, name: "Lucky", initials: "LU", color: "#B06C7E" },
  { id: 3, name: "Ula", initials: "UL", color: "#547C78" },
  { id: 4, name: "Landen", initials: "LA", color: "#C1815B" },
  { id: 5, name: "Anna", initials: "AN", color: "#7B6F9E" },
];

export const categories = {
  餐饮: { icon: "🍜", color: "#B76770" },
  零食: { icon: "🍪", color: "#9B6B48" },
  日用品: { icon: "🧴", color: "#547C78" },
  聚会: { icon: "🎉", color: "#796597" },
  交通: { icon: "🚕", color: "#B1743F" },
  其他: { icon: "✦", color: "#6D6D73" },
};

export const initialBills = [
  { id: 6, title: "周末火锅", amount: 328, category: "餐饮", payer: 1, participants: [1,2,3,4,5], date: "2026-07-25", note: "番茄锅底 + 饮料" },
  { id: 5, title: "超市补给", amount: 186.5, category: "日用品", payer: 3, participants: [1,2,3,4,5], date: "2026-07-24", note: "纸巾、洗衣液和厨房用品" },
  { id: 4, title: "桌游之夜", amount: 125, category: "聚会", payer: 2, participants: [1,2,4,5], date: "2026-07-23", note: "场地和饮料" },
  { id: 3, title: "下午茶", amount: 88, category: "零食", payer: 5, participants: [2,3,5], date: "2026-07-21", note: "" },
  { id: 2, title: "打车回家", amount: 64, category: "交通", payer: 4, participants: [1,3,4], date: "2026-07-19", note: "" },
  { id: 1, title: "月初聚餐", amount: 456, category: "餐饮", payer: 1, participants: [1,2,3,4,5], date: "2026-07-05", note: "七月第一次聚餐" },
];

export function formatMoney(value) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency", currency: "CNY", minimumFractionDigits: 2,
  }).format(value);
}

export function summarizeSpending(bills) {
  const byCategory = Object.keys(categories).map((name) => ({
    name,
    amount: 0,
    count: 0,
    ...categories[name],
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
    byPayer: members
      .map((member) => ({ ...member, amount: byPayer.get(member.id) ?? 0 }))
      .sort((a, b) => b.amount - a.amount),
  };
}
