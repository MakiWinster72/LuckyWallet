import calendar
from datetime import date
from decimal import Decimal
import re

from app.repositories.statistics_repository import StatisticsRepository


MONTH_PATTERN = re.compile(r"^(\d{4})-(\d{2})$")


class InvalidStatisticsMonth(Exception):
    pass


class StatisticsService:
    def __init__(self, repository: StatisticsRepository) -> None:
        self.repository = repository

    def monthly_summary(self, month: str) -> dict:
        match = MONTH_PATTERN.fullmatch(month)
        if match is None:
            raise InvalidStatisticsMonth

        year, month_number = map(int, match.groups())
        if not 1 <= month_number <= 12:
            raise InvalidStatisticsMonth

        start_date = date(year, month_number, 1)
        end_date = date(year, month_number, calendar.monthrange(year, month_number)[1])
        summary = self.repository.summarize(start_date, end_date)
        count = summary["count"]
        return {
            **summary,
            "month": month,
            "average": summary["total"] / count if count else Decimal("0"),
        }
