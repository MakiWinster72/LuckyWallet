function sameMember(left, right) {
  return String(left) === String(right);
}

function percentage(part, total) {
  return total > 0 ? (part / total) * 100 : 0;
}

export function summarizeProfileFinance(bills, currentMemberId) {
  let paid = 0;
  let share = 0;
  let totalExpense = 0;

  for (const bill of bills ?? []) {
    const amount = Number(bill.amount) || 0;
    const participants = Array.isArray(bill.participants) ? bill.participants : [];

    totalExpense += amount;
    if (sameMember(bill.payer, currentMemberId)) paid += amount;

    if (participants.length) {
      const equalShare = amount / participants.length;
      if (participants.some((id) => sameMember(id, currentMemberId))) {
        share += equalShare;
      }
    }
  }

  return {
    paid,
    paidRatio: percentage(paid, totalExpense),
    share,
    shareRatio: percentage(share, totalExpense),
    totalExpense,
  };
}
