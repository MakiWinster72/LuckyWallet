from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class BillWrite(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    amount: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    payer_id: int = Field(gt=0)
    bill_date: date
    category_id: int = Field(gt=0)
    participant_ids: list[int] = Field(min_length=1)
    note: str | None = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_participants(self) -> "BillWrite":
        if len(set(self.participant_ids)) != len(self.participant_ids):
            raise ValueError("参与成员不能重复")
        if any(user_id <= 0 for user_id in self.participant_ids):
            raise ValueError("参与成员 ID 必须为正整数")
        return self


class BillCreate(BillWrite):
    pass


class BillUpdate(BillWrite):
    pass


class ParticipantResponse(BaseModel):
    user_id: int
    share_amount: Decimal

    model_config = ConfigDict(from_attributes=True)


class CategoryResponse(BaseModel):
    id: int
    name: str
    icon: str | None

    model_config = ConfigDict(from_attributes=True)


class BillResponse(BaseModel):
    id: int
    title: str
    amount: Decimal
    payer_id: int
    bill_date: date
    category: CategoryResponse
    note: str | None
    created_by: int
    created_at: datetime
    participants: list[ParticipantResponse]

    model_config = ConfigDict(from_attributes=True)
