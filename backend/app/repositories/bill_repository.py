from __future__ import annotations

from datetime import date

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models import Bill, Category, User


class BillRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list(
        self,
        *,
        start_date: date | None = None,
        end_date: date | None = None,
        category_id: int | None = None,
    ) -> list[Bill]:
        statement: Select[tuple[Bill]] = select(Bill).order_by(
            Bill.bill_date.desc(),
            Bill.id.desc(),
        )
        if start_date is not None:
            statement = statement.where(Bill.bill_date >= start_date)
        if end_date is not None:
            statement = statement.where(Bill.bill_date <= end_date)
        if category_id is not None:
            statement = statement.where(Bill.category_id == category_id)
        return list(self.session.scalars(statement).unique())

    def get_by_id(self, bill_id: int) -> Bill | None:
        return self.session.get(Bill, bill_id)

    def get_category(self, category_id: int) -> Category | None:
        return self.session.get(Category, category_id)

    def get_users(self, user_ids: set[int]) -> list[User]:
        if not user_ids:
            return []
        statement = select(User).where(User.id.in_(user_ids), User.is_active.is_(True))
        return list(self.session.scalars(statement))

    def add(self, bill: Bill) -> Bill:
        self.session.add(bill)
        self.session.flush()
        return bill

    def delete(self, bill: Bill) -> None:
        self.session.delete(bill)

    def commit(self) -> None:
        self.session.commit()

    def rollback(self) -> None:
        self.session.rollback()

    def refresh(self, bill: Bill) -> Bill:
        self.session.refresh(bill)
        return bill
