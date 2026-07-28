function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text)
    ? `"${text.replaceAll("\"", "\"\"")}"`
    : text;
}

function exportFile(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getBillRows(bills = [], members = []) {
  const memberNames = new Map(
    members.map((member) => [String(member.id), member.name]),
  );
  return [
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
}

export function buildBillsCsv(bills = [], members = []) {
  const rows = getBillRows(bills, members);
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

export function downloadBillsCsv({ bills, members, rangeLabel }) {
  const content = buildBillsCsv(bills, members);
  const safeRange = String(rangeLabel || "全部账单").replace(/[\\/:*?"<>|]/g, "-");
  exportFile(content, `LuckyWallet-账单-${safeRange}.csv`, "text/csv;charset=utf-8");
}
