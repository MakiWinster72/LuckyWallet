from fastapi import APIRouter

from app.api.deps import AdminUser, CurrentUser, DbSession
from app.models import HouseholdSetting
from app.repositories.budget_repository import BudgetRepository
from app.schemas.budget import BudgetRead, BudgetUpdate
from app.services.budget_service import BudgetService


router = APIRouter(prefix="/settings", tags=["家庭设置"])


def get_service(db: DbSession) -> BudgetService:
    return BudgetService(BudgetRepository(db))


@router.get("/budget", response_model=BudgetRead)
def get_budget(db: DbSession, current_user: CurrentUser) -> HouseholdSetting:
    del current_user
    return get_service(db).get_budget()


@router.put("/budget", response_model=BudgetRead)
def update_budget(
    data: BudgetUpdate,
    db: DbSession,
    current_admin: AdminUser,
) -> HouseholdSetting:
    del current_admin
    return get_service(db).update_budget(data)
