export const categories = {
  餐饮: { icon: "🍜", color: "var(--color-category-food)" },
  零食: { icon: "🍪", color: "var(--color-category-snack)" },
  日用品: { icon: "🧴", color: "var(--color-category-daily)" },
  聚会: { icon: "🎉", color: "var(--color-category-party)" },
  交通: { icon: "🚕", color: "var(--color-category-transport)" },
  其他: { icon: "✦", color: "var(--color-category-other)" },
};

export function getCategory(name) {
  return categories[name] ?? categories.其他;
}
