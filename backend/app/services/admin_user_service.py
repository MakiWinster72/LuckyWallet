from datetime import UTC, datetime

from sqlalchemy.exc import IntegrityError

from app.core.security import hash_password
from app.models import User
from app.repositories.user_repository import UserRepository
from app.schemas.admin_user import AdminUserCreate, AdminUserUpdate


class UserNotFoundError(Exception):
    pass


class UsernameAlreadyExistsError(Exception):
    pass


class SelfProtectionError(Exception):
    pass


class LastActiveAdminError(Exception):
    pass


class AdminUserService:
    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    def list_users(self) -> list[User]:
        return self.repository.list_all()

    def create_user(self, payload: AdminUserCreate) -> User:
        username = payload.username.strip()
        if self.repository.get_by_username(username) is not None:
            raise UsernameAlreadyExistsError

        user = User(
            username=username,
            password_hash=hash_password(payload.password),
            nickname=payload.nickname.strip(),
            role=payload.role,
            is_active=True,
        )
        try:
            self.repository.add(user)
            self.repository.commit()
        except IntegrityError:
            self.repository.rollback()
            raise UsernameAlreadyExistsError from None
        return user

    def update_user(
        self,
        user_id: int,
        payload: AdminUserUpdate,
        current_user: User,
    ) -> User:
        user = self.repository.get_by_id(user_id)
        if user is None:
            raise UserNotFoundError

        changes = payload.model_dump(exclude_unset=True)
        removes_admin_access = (
            changes.get("role", user.role) != "admin"
            or changes.get("is_active", user.is_active) is False
        )
        if user.id == current_user.id and removes_admin_access:
            raise SelfProtectionError
        if (
            user.role == "admin"
            and user.is_active
            and removes_admin_access
            and self.repository.count_active_admins() <= 1
        ):
            raise LastActiveAdminError

        if "nickname" in changes:
            user.nickname = changes["nickname"].strip()
        if "role" in changes:
            user.role = changes["role"]
        if "is_active" in changes:
            user.is_active = changes["is_active"]
        user.updated_at = datetime.now(UTC).replace(tzinfo=None)
        self.repository.commit()
        return user
