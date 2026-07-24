from datetime import UTC, datetime

from app.core.security import create_access_token, verify_password
from app.models import AuditLog, User
from app.repositories.user_repository import UserRepository


class InvalidCredentialsError(Exception):
    pass


class AuthService:
    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    def login(
        self,
        username: str,
        password: str,
        ip: str | None,
        user_agent: str | None,
    ) -> tuple[User, str]:
        normalized_username = username.strip()
        user = self.repository.get_by_username(normalized_username)

        if (
            user is None
            or not verify_password(password, user.password_hash)
            or not user.is_active
        ):
            self._record_login(
                user=user,
                action="login_failed",
                ip=ip,
                user_agent=user_agent,
            )
            raise InvalidCredentialsError

        access_token = create_access_token(user.id)
        self._record_login(
            user=user,
            action="login_success",
            ip=ip,
            user_agent=user_agent,
        )
        return user, access_token

    def _record_login(
        self,
        user: User | None,
        action: str,
        ip: str | None,
        user_agent: str | None,
    ) -> None:
        audit_log = AuditLog(
            user_id=user.id if user else None,
            action=action,
            resource_type="user",
            resource_id=user.id if user else None,
            ip=ip,
            user_agent=user_agent[:255] if user_agent else None,
            detail=None,
            created_at=datetime.now(UTC).replace(tzinfo=None),
        )
        try:
            self.repository.add_audit_log(audit_log)
            self.repository.commit()
        except Exception:
            self.repository.rollback()
            raise
