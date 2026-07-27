from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.models import HouseholdSetting
from app.schemas.budget import BudgetUpdate
from app.services.budget_service import BudgetService


class FakeBudgetRepository:
    def __init__(self, setting: HouseholdSetting | None = None) -> None:
        self.setting = setting
        self.saved: HouseholdSetting | None = None

    def get(self) -> HouseholdSetting | None:
        return self.setting

    def save(self, setting: HouseholdSetting) -> HouseholdSetting:
        self.saved = setting
        self.setting = setting
        return setting


def test_returns_the_persisted_monthly_budget() -> None:
    setting = HouseholdSetting(id=1, monthly_budget=Decimal("3600.00"))

    result = BudgetService(FakeBudgetRepository(setting)).get_budget()

    assert result.monthly_budget == Decimal("3600.00")


def test_uses_the_default_budget_before_a_setting_is_saved() -> None:
    result = BudgetService(FakeBudgetRepository()).get_budget()

    assert result.monthly_budget == Decimal("2400.00")


def test_updates_and_persists_the_monthly_budget() -> None:
    repository = FakeBudgetRepository()

    result = BudgetService(repository).update_budget(
        BudgetUpdate(monthly_budget=Decimal("4200.50")),
    )

    assert result.monthly_budget == Decimal("4200.50")
    assert repository.saved is result


@pytest.mark.parametrize("value", ["0", "-100"])
def test_rejects_a_non_positive_monthly_budget(value: str) -> None:
    with pytest.raises(ValidationError):
        BudgetUpdate(monthly_budget=Decimal(value))
