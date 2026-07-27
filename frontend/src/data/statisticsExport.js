function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

export function buildStatisticsCsv({ month, bills, members }) {
  const memberNames = new Map(members.map((member) => [String(member.id), member.name]));
  const total = bills.reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);
  const rows = [
    ["LuckyWallet 支出统计"],
    ["统计月份", month],
    ["总支出", total.toFixed(2)],
    ["账单笔数", bills.length],
    ["平均每笔", (bills.length ? total / bills.length : 0).toFixed(2)],
    [],
    ["日期", "账单名称", "分类", "付款人", "金额", "参与人数", "备注"],
    ...bills.map((bill) => [
      bill.date,
      bill.title,
      bill.category,
      memberNames.get(String(bill.payer)) ?? "未知成员",
      (Number(bill.amount) || 0).toFixed(2),
      Array.isArray(bill.participants) ? bill.participants.length : 0,
      bill.note ?? "",
    ]),
  ];
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

export function downloadStatisticsCsv(data) {
  const content = buildStatisticsCsv(data);
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `LuckyWallet-${data.month}-支出统计.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
