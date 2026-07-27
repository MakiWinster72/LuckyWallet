from decimal import Decimal

from sqlalchemy import DECIMAL, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class HouseholdSetting(Base):
    __tablename__ = "household_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    monthly_budget: Mapped[Decimal] = mapped_column(
        DECIMAL(10, 2),
        nullable=False,
        default=Decimal("2400.00"),
    )
