from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Bill, Category, User


class StatisticsRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def summarize(self, start_date: date, end_date: date) -> dict:
        date_filter = (Bill.bill_date >= start_date, Bill.bill_date <= end_date)
        total, count = self.session.execute(
            select(func.coalesce(func.sum(Bill.amount), 0), func.count(Bill.id))
            .where(*date_filter),
        ).one()

        category_rows = self.session.execute(
            select(
                Category.id,
                Category.name,
                func.sum(Bill.amount).label("amount"),
                func.count(Bill.id).label("count"),
            )
            .join(Bill, Bill.category_id == Category.id)
            .where(*date_filter)
            .group_by(Category.id, Category.name)
            .order_by(func.sum(Bill.amount).desc(), Category.id),
        ).all()
        payer_rows = self.session.execute(
            select(
                User.id,
                User.username,
                User.nickname,
                func.sum(Bill.amount).label("amount"),
                func.count(Bill.id).label("count"),
            )
            .join(Bill, Bill.payer_id == User.id)
            .where(*date_filter)
            .group_by(User.id, User.username, User.nickname)
            .order_by(func.sum(Bill.amount).desc(), User.id),
        ).all()

        return {
            "total": Decimal(total),
            "count": count,
            "categories": [
                {"id": row.id, "name": row.name, "amount": row.amount, "count": row.count}
                for row in category_rows
            ],
            "payers": [
                {
                    "id": row.id,
                    "name": row.nickname.strip() if row.nickname and row.nickname.strip() else row.username,
                    "amount": row.amount,
                    "count": row.count,
                }
                for row in payer_rows
            ],
        }
