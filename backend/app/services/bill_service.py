from datetime import date
from decimal import Decimal, ROUND_DOWN

from app.models import Bill, BillParticipant
from app.repositories.bill_repository import BillRepository
from app.schemas.bill import BillCreate, BillUpdate


class BillNotFoundError(Exception):
    pass


class InvalidBillReferenceError(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class BillService:
    def __init__(self, repository: BillRepository) -> None:
        self.repository = repository

    def list_bills(
        self,
        *,
        start_date: date | None = None,
        end_date: date | None = None,
        category_id: int | None = None,
    ) -> list[Bill]:
        if start_date is not None and end_date is not None and start_date > end_date:
            raise InvalidBillReferenceError("开始日期不能晚于结束日期")
        return self.repository.list(
            start_date=start_date,
            end_date=end_date,
            category_id=category_id,
        )

    def get_bill(self, bill_id: int) -> Bill:
        bill = self.repository.get_by_id(bill_id)
        if bill is None:
            raise BillNotFoundError
        return bill

    def create_bill(self, data: BillCreate, *, created_by: int) -> Bill:
        self._validate_references(data)
        bill = Bill(created_by=created_by)
        self._apply_write_data(bill, data)
        try:
            self.repository.add(bill)
            self.repository.commit()
        except Exception:
            self.repository.rollback()
            raise
        return self.repository.refresh(bill)

    def update_bill(self, bill_id: int, data: BillUpdate) -> Bill:
        bill = self.get_bill(bill_id)
        self._validate_references(data)
        self._apply_write_data(bill, data)
        try:
            self.repository.commit()
        except Exception:
            self.repository.rollback()
            raise
        return self.repository.refresh(bill)

    def delete_bill(self, bill_id: int) -> None:
        bill = self.get_bill(bill_id)
        try:
            self.repository.delete(bill)
            self.repository.commit()
        except Exception:
            self.repository.rollback()
            raise

    def _validate_references(self, data: BillCreate | BillUpdate) -> None:
        category = self.repository.get_category(data.category_id)
        if category is None or not category.is_active:
            raise InvalidBillReferenceError("账单分类不存在或已停用")

        expected_user_ids = set(data.participant_ids)
        expected_user_ids.add(data.payer_id)
        existing_user_ids = {
            user.id for user in self.repository.get_users(expected_user_ids)
        }
        if existing_user_ids != expected_user_ids:
            raise InvalidBillReferenceError("付款人或参与成员不存在或已停用")

    @staticmethod
    def _apply_write_data(bill: Bill, data: BillCreate | BillUpdate) -> None:
        bill.title = data.title.strip()
        bill.amount = data.amount
        bill.payer_id = data.payer_id
        bill.bill_date = data.bill_date
        bill.category_id = data.category_id
        bill.note = data.note.strip() if data.note else None
        bill.participants = BillService._build_participants(
            data.amount,
            data.participant_ids,
        )

    @staticmethod
    def _build_participants(
        amount: Decimal,
        participant_ids: list[int],
    ) -> list[BillParticipant]:
        cent = Decimal("0.01")
        base_share = (amount / len(participant_ids)).quantize(
            cent,
            rounding=ROUND_DOWN,
        )
        remaining_cents = int((amount - base_share * len(participant_ids)) / cent)
        return [
            BillParticipant(
                user_id=user_id,
                share_amount=base_share + (cent if index < remaining_cents else 0),
            )
            for index, user_id in enumerate(participant_ids)
        ]
