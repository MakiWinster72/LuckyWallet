export const categories = {
  餐饮: { icon: "🍜", color: "#B76770" },
  零食: { icon: "🍪", color: "#9B6B48" },
  日用品: { icon: "🧴", color: "#547C78" },
  聚会: { icon: "🎉", color: "#796597" },
  交通: { icon: "🚕", color: "#B1743F" },
  其他: { icon: "✦", color: "#6D6D73" },
};

export function getCategory(name) {
  return categories[name] ?? categories.其他;
}
