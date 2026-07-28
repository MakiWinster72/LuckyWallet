function pad(value) {
  return String(value).padStart(2, "0");
}

function sameMember(left, right) {
  return String(left) === String(right);
}

function monthlyBuckets(referenceDate) {
  const [year, month] = referenceDate.slice(0, 7).split("-").map(Number);
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(year, month - 6 + index, 1);
    return {
      month: `${date.getFullYear()}-${pad(date.getMonth() + 1)}`,
      label: `${date.getMonth() + 1}月`,
      expense: 0,
      income: 0,
    };
  });
}

export function summarizeMemberFinance(bills, memberId, referenceDate) {
  const series = monthlyBuckets(referenceDate);
  const seriesIndex = new Map(series.map((item) => [item.month, item]));
  let expense = 0;
  let income = 0;

  for (const bill of bills) {
    const amount = Number(bill.amount) || 0;
    const participants = Array.isArray(bill.participants) ? bill.participants : [];
    const participates = participants.some((id) => sameMember(id, memberId));
    const memberShare = participates && participants.length ? amount / participants.length : 0;
    const memberIncome = sameMember(bill.payer, memberId)
      ? Math.max(amount - memberShare, 0)
      : 0;

    expense += memberShare;
    income += memberIncome;
    const bucket = seriesIndex.get(bill.date?.slice(0, 7));
    if (bucket) {
      bucket.expense += memberShare;
      bucket.income += memberIncome;
    }
  }

  return {
    expense,
    income,
    net: income - expense,
    series,
  };
}
