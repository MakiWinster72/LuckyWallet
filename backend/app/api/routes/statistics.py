from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import CurrentUser, DbSession
from app.repositories.statistics_repository import StatisticsRepository
from app.schemas.statistics import MonthlyStatisticsResponse
from app.services.statistics_service import InvalidStatisticsMonth, StatisticsService


router = APIRouter(prefix="/statistics", tags=["统计"])


@router.get("/monthly", response_model=MonthlyStatisticsResponse)
def monthly_statistics(
    db: DbSession,
    current_user: CurrentUser,
    month: str = Query(pattern=r"^\d{4}-\d{2}$"),
) -> dict:
    del current_user
    try:
        return StatisticsService(StatisticsRepository(db)).monthly_summary(month)
    except InvalidStatisticsMonth:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "INVALID_MONTH", "message": "月份格式必须为 YYYY-MM"},
        ) from None
