export function buildMemberStats(members, bills) {
  const stats = new Map(members.map((member) => [member.id, {
    member,
    paid: 0,
    share: 0,
    balance: 0,
    billCount: 0,
    lastActive: null,
  }]));

  for (const bill of bills) {
    const share = bill.participants.length ? bill.amount / bill.participants.length : 0;
    const payer = stats.get(bill.payer);

    if (payer) payer.paid += bill.amount;
    for (const memberId of bill.participants) {
      const entry = stats.get(memberId);
      if (!entry) continue;
      entry.share += share;
      entry.billCount += 1;
      if (!entry.lastActive || bill.date > entry.lastActive) entry.lastActive = bill.date;
    }
  }

  return members.map((member) => {
    const entry = stats.get(member.id);
    return {
      ...entry,
      balance: entry.paid - entry.share,
      status: entry.lastActive ? "已加入" : "待激活",
    };
  });
}

export function summarizeMembers(memberStats) {
  return memberStats.reduce((summary, item) => ({
    paid: summary.paid + item.paid,
    positive: summary.positive + Math.max(item.balance, 0),
    active: summary.active + (item.status === "已加入" ? 1 : 0),
  }), { paid: 0, positive: 0, active: 0 });
}
