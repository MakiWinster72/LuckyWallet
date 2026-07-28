from datetime import date
from decimal import Decimal

import pytest

from app.services.statistics_service import InvalidStatisticsMonth, StatisticsService


class FakeStatisticsRepository:
    def __init__(self) -> None:
        self.range: tuple[date, date] | None = None

    def summarize(self, start_date: date, end_date: date) -> dict:
        self.range = (start_date, end_date)
        return {
            "total": Decimal("320.50"),
            "count": 4,
            "categories": [
                {"id": 1, "name": "餐饮", "amount": Decimal("220.50"), "count": 3},
            ],
            "payers": [
                {"id": 7, "name": "Ula", "amount": Decimal("320.50"), "count": 4},
            ],
        }


def test_monthly_summary_uses_exact_calendar_boundaries() -> None:
    repository = FakeStatisticsRepository()

    result = StatisticsService(repository).monthly_summary("2026-07")

    assert repository.range == (date(2026, 7, 1), date(2026, 7, 31))
    assert result["total"] == Decimal("320.50")
    assert result["average"] == Decimal("80.125")
    assert result["month"] == "2026-07"


@pytest.mark.parametrize("month", ["2026-00", "2026-13", "July", "2026-7"])
def test_monthly_summary_rejects_invalid_months(month: str) -> None:
    with pytest.raises(InvalidStatisticsMonth):
        StatisticsService(FakeStatisticsRepository()).monthly_summary(month)


def test_monthly_summary_returns_zero_average_without_bills() -> None:
    class EmptyRepository(FakeStatisticsRepository):
        def summarize(self, start_date: date, end_date: date) -> dict:
            return {"total": Decimal("0"), "count": 0, "categories": [], "payers": []}

    result = StatisticsService(EmptyRepository()).monthly_summary("2026-02")

    assert result["average"] == Decimal("0")
