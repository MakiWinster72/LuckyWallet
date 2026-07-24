from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AuditLog, User


class UserRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_username(self, username: str) -> User | None:
        statement = select(User).where(User.username == username)
        return self.session.scalar(statement)

    def get_by_id(self, user_id: int) -> User | None:
        return self.session.get(User, user_id)

    def add(self, user: User) -> User:
        self.session.add(user)
        self.session.flush()
        return user

    def add_audit_log(self, audit_log: AuditLog) -> None:
        self.session.add(audit_log)

    def commit(self) -> None:
        self.session.commit()

    def rollback(self) -> None:
        self.session.rollback()
