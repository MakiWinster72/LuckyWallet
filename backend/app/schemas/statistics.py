from decimal import Decimal

from pydantic import BaseModel


class StatisticsBreakdown(BaseModel):
    id: int
    name: str
    amount: Decimal
    count: int


class MonthlyStatisticsResponse(BaseModel):
    month: str
    total: Decimal
    count: int
    average: Decimal
    categories: list[StatisticsBreakdown]
    payers: list[StatisticsBreakdown]
