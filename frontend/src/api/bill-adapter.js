const categoryIds = {
  餐饮: 1,
  零食: 2,
  日用品: 3,
  聚会: 4,
  交通: 5,
  其他: 6,
};

export function adaptBillFromApi(bill) {
  return {
    id: bill.id,
    title: bill.title,
    amount: Number(bill.amount),
    category: bill.category.name,
    payer: bill.payer_id,
    participants: bill.participants.map((participant) => participant.user_id),
    date: bill.bill_date,
    note: bill.note ?? "",
  };
}

export function adaptBillToApi(bill) {
  return {
    title: bill.title,
    amount: Number(bill.amount),
    payer_id: Number(bill.payer),
    bill_date: bill.date,
    category_id: categoryIds[bill.category],
    participant_ids: bill.participants,
    note: bill.note || null,
  };
}
