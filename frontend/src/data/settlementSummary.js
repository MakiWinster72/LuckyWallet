function sameMember(left, right) {
  return String(left) === String(right);
}

export function summarizePendingSettlement(bills, currentMemberId) {
  if (currentMemberId === undefined || currentMemberId === null) {
    return { amount: 0, count: 0 };
  }

  let amountInCents = 0;
  let count = 0;

  for (const bill of bills ?? []) {
    const participants = Array.isArray(bill.participants) ? bill.participants : [];
    const owesShare = participants.some((id) => sameMember(id, currentMemberId));
    if (!participants.length || !owesShare || sameMember(bill.payer, currentMemberId)) {
      continue;
    }

    const billAmount = Number(bill.amount);
    if (!Number.isFinite(billAmount)) continue;

    amountInCents += Math.round((billAmount * 100) / participants.length);
    count += 1;
  }

  return { amount: amountInCents / 100, count };
}
