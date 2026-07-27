import { selectMonthlyBills } from "./monthlyBills.js";

function sameMember(left, right) {
  return String(left) === String(right);
}

function percentage(part, total) {
  return total > 0 ? (part / total) * 100 : 0;
}

export function summarizeProfileFinance(bills, currentMemberId, referenceDate) {
  const monthlyBills = selectMonthlyBills(bills ?? [], referenceDate);
  let paid = 0;
  let share = 0;
  let householdPaid = 0;
  let householdShare = 0;

  for (const bill of monthlyBills) {
    const amount = Number(bill.amount) || 0;
    const participants = Array.isArray(bill.participants) ? bill.participants : [];

    householdPaid += amount;
    if (sameMember(bill.payer, currentMemberId)) paid += amount;

    if (participants.length) {
      const equalShare = amount / participants.length;
      householdShare += equalShare * participants.length;
      if (participants.some((id) => sameMember(id, currentMemberId))) {
        share += equalShare;
      }
    }
  }

  return {
    paid,
    paidRatio: percentage(paid, householdPaid),
    share,
    shareRatio: percentage(share, householdShare),
    householdPaid,
    householdShare,
  };
}
