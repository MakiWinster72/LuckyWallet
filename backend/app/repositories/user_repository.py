from sqlalchemy import func, select
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

    def list_all(self) -> list[User]:
        statement = select(User).order_by(User.created_at.desc(), User.id.desc())
        return list(self.session.scalars(statement))

    def list_active(self) -> list[User]:
        statement = select(User).where(User.is_active.is_(True)).order_by(User.id)
        return list(self.session.scalars(statement))

    def count_active_admins(self) -> int:
        statement = select(func.count(User.id)).where(
            User.role == "admin",
            User.is_active.is_(True),
        )
        return self.session.scalar(statement) or 0

    def add(self, user: User) -> User:
        self.session.add(user)
        self.session.flush()
        return user

    def flush(self) -> None:
        self.session.flush()

    def add_audit_log(self, audit_log: AuditLog) -> None:
        self.session.add(audit_log)

    def commit(self) -> None:
        self.session.commit()

    def rollback(self) -> None:
        self.session.rollback()
