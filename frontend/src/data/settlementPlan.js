function memberKey(value) {
  return String(value);
}

function displayName(memberId, membersById) {
  return membersById.get(memberKey(memberId))?.name || `未知成员 #${memberId}`;
}

function addBalance(balances, memberId, amountInCents) {
  const key = memberKey(memberId);
  const current = balances.get(key) ?? { id: memberId, cents: 0 };
  balances.set(key, { ...current, cents: current.cents + amountInCents });
}

function allocateShares(amountInCents, participantIds) {
  const share = Math.floor(amountInCents / participantIds.length);
  const remainder = amountInCents % participantIds.length;
  return participantIds.map((id, index) => ({
    id,
    cents: share + (index < remainder ? 1 : 0),
  }));
}

export function createSettlementPlan(bills = [], members = []) {
  const membersById = new Map(members.map((member) => [memberKey(member.id), member]));
  const balances = new Map();

  for (const bill of bills) {
    const amountInCents = Math.round(Number(bill.amount) * 100);
    const participantIds = [...new Map(
      (Array.isArray(bill.participants) ? bill.participants : [])
        .filter((id) => id !== null && id !== undefined)
        .map((id) => [memberKey(id), id]),
    ).values()];
    if (!Number.isFinite(amountInCents) || amountInCents <= 0 || bill.payer == null || !participantIds.length) {
      continue;
    }

    addBalance(balances, bill.payer, amountInCents);
    for (const share of allocateShares(amountInCents, participantIds)) {
      addBalance(balances, share.id, -share.cents);
    }
  }

  const creditors = [...balances.values()]
    .filter(({ cents }) => cents > 0)
    .map((item) => ({ ...item }))
    .sort((left, right) => right.cents - left.cents);
  const debtors = [...balances.values()]
    .filter(({ cents }) => cents < 0)
    .map((item) => ({ ...item, cents: -item.cents }))
    .sort((left, right) => right.cents - left.cents);
  const transfers = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const cents = Math.min(debtor.cents, creditor.cents);
    transfers.push({
      fromId: debtor.id,
      fromName: displayName(debtor.id, membersById),
      toId: creditor.id,
      toName: displayName(creditor.id, membersById),
      amount: cents / 100,
    });
    debtor.cents -= cents;
    creditor.cents -= cents;
    if (debtor.cents === 0) debtorIndex += 1;
    if (creditor.cents === 0) creditorIndex += 1;
  }

  return {
    transfers,
    balances: [...balances.values()].map(({ id, cents }) => ({
      id,
      name: displayName(id, membersById),
      balance: cents / 100,
    })),
    total: transfers.reduce((sum, transfer) => sum + transfer.amount, 0),
  };
}
