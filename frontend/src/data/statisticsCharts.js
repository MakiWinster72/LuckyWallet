function pad(value) {
  return String(value).padStart(2, "0");
}

export function buildMonthlySeries(bills, referenceDate, monthCount = 6) {
  const [year, month] = referenceDate.slice(0, 7).split("-").map(Number);
  const buckets = Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(year, month - monthCount + index, 1);
    const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
    return {
      month: key,
      label: `${date.getMonth() + 1}月`,
      total: 0,
      count: 0,
    };
  });
  const index = new Map(buckets.map((item) => [item.month, item]));
  for (const bill of bills) {
    const bucket = index.get(bill.date?.slice(0, 7));
    if (!bucket) continue;
    bucket.total += Number(bill.amount) || 0;
    bucket.count += 1;
  }
  return buckets;
}

export function buildDailySeries(bills, referenceDate) {
  const [year, month] = referenceDate.slice(0, 7).split("-").map(Number);
  const dayCount = new Date(year, month, 0).getDate();
  const monthKey = `${year}-${pad(month)}`;
  const dailyTotals = new Map();
  for (const bill of bills) {
    if (bill.date?.slice(0, 7) !== monthKey) continue;
    dailyTotals.set(bill.date, (dailyTotals.get(bill.date) ?? 0) + (Number(bill.amount) || 0));
  }
  return Array.from({ length: dayCount }, (_, index) => {
    const day = index + 1;
    const date = `${monthKey}-${pad(day)}`;
    return { day, date, total: dailyTotals.get(date) ?? 0 };
  });
}

export function buildSmoothSvgPath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  const commands = [`M ${points[0].x} ${points[0].y}`];
  for (let index = 0; index < points.length - 1; index += 1) {
    const before = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const after = points[index + 2] ?? next;
    const controlOne = {
      x: current.x + (next.x - before.x) / 6,
      y: current.y + (next.y - before.y) / 6,
    };
    const controlTwo = {
      x: next.x - (after.x - current.x) / 6,
      y: next.y - (after.y - current.y) / 6,
    };
    commands.push(
      `C ${controlOne.x.toFixed(1)} ${controlOne.y.toFixed(1)} `
      + `${controlTwo.x.toFixed(1)} ${controlTwo.y.toFixed(1)} ${next.x} ${next.y}`,
    );
  }
  return commands.join(" ");
}
