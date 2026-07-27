from datetime import date
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.models import Bill
from app.repositories.bill_repository import BillRepository
from app.schemas.bill import BillCreate
from app.services.bill_service import BillService, InvalidBillReferenceError


def make_payload(amount: str = "100.00") -> BillCreate:
    return BillCreate(
        title=" 周末聚餐 ",
        amount=Decimal(amount),
        payer_id=1,
        bill_date=date(2026, 7, 27),
        category_id=2,
        participant_ids=[1, 2, 3],
        note=" 大家一起吃饭 ",
    )


def make_repository() -> Mock:
    repository = Mock(spec=BillRepository)
    repository.get_category.return_value = SimpleNamespace(is_active=True)
    repository.get_users.return_value = [
        SimpleNamespace(id=1),
        SimpleNamespace(id=2),
        SimpleNamespace(id=3),
    ]
    repository.add.side_effect = lambda bill: bill
    repository.refresh.side_effect = lambda bill: bill
    return repository


def test_create_bill_distributes_every_cent_and_normalizes_text() -> None:
    repository = make_repository()

    bill = BillService(repository).create_bill(make_payload(), created_by=9)

    assert bill.title == "周末聚餐"
    assert bill.note == "大家一起吃饭"
    assert bill.created_by == 9
    assert [item.share_amount for item in bill.participants] == [
        Decimal("33.34"),
        Decimal("33.33"),
        Decimal("33.33"),
    ]
    assert sum(item.share_amount for item in bill.participants) == bill.amount
    repository.commit.assert_called_once_with()


def test_create_bill_rejects_inactive_or_missing_user() -> None:
    repository = make_repository()
    repository.get_users.return_value = [SimpleNamespace(id=1), SimpleNamespace(id=2)]

    with pytest.raises(
        InvalidBillReferenceError,
        match="付款人或参与成员不存在或已停用",
    ):
        BillService(repository).create_bill(make_payload(), created_by=9)

    repository.add.assert_not_called()
    repository.commit.assert_not_called()


def test_list_bills_rejects_reversed_date_range() -> None:
    repository = make_repository()

    with pytest.raises(InvalidBillReferenceError, match="开始日期不能晚于结束日期"):
        BillService(repository).list_bills(
            start_date=date(2026, 7, 28),
            end_date=date(2026, 7, 27),
        )

    repository.list.assert_not_called()
