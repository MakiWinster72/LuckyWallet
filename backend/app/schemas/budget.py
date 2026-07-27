from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class BudgetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    monthly_budget: Decimal


class BudgetUpdate(BaseModel):
    monthly_budget: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
