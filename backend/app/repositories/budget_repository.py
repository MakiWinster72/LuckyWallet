from sqlalchemy.orm import Session

from app.models import HouseholdSetting


class BudgetRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self) -> HouseholdSetting | None:
        return self.session.get(HouseholdSetting, 1)

    def save(self, setting: HouseholdSetting) -> HouseholdSetting:
        self.session.add(setting)
        self.session.commit()
        self.session.refresh(setting)
        return setting
