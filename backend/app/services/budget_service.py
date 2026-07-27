from decimal import Decimal

from app.models import HouseholdSetting
from app.repositories.budget_repository import BudgetRepository
from app.schemas.budget import BudgetUpdate


DEFAULT_MONTHLY_BUDGET = Decimal("2400.00")


class BudgetService:
    def __init__(self, repository: BudgetRepository) -> None:
        self.repository = repository

    def get_budget(self) -> HouseholdSetting:
        return self.repository.get() or HouseholdSetting(
            id=1,
            monthly_budget=DEFAULT_MONTHLY_BUDGET,
        )

    def update_budget(self, payload: BudgetUpdate) -> HouseholdSetting:
        setting = self.repository.get() or HouseholdSetting(id=1)
        setting.monthly_budget = payload.monthly_budget
        return self.repository.save(setting)
