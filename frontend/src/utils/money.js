export function formatMoney(value) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency", currency: "CNY", minimumFractionDigits: 2,
  }).format(value);
}
