from datetime import datetime

import pytest

from app.core.security import verify_password
from app.models import User
from app.schemas.admin_user import AdminUserCreate, AdminUserUpdate
from app.services.admin_user_service import (
    AdminUserService,
    LastActiveAdminError,
    SelfProtectionError,
    UsernameAlreadyExistsError,
)


def make_user(
    user_id: int,
    username: str,
    role: str = "user",
    is_active: bool = True,
) -> User:
    now = datetime(2026, 7, 27, 21, 0)
    return User(
        id=user_id,
        username=username,
        nickname=username.title(),
        password_hash="stored",
        role=role,
        is_active=is_active,
        created_at=now,
        updated_at=now,
    )


class FakeUserRepository:
    def __init__(self, users: list[User]) -> None:
        self.users = users
        self.commits = 0

    def list_all(self) -> list[User]:
        return self.users

    def get_by_username(self, username: str) -> User | None:
        return next((user for user in self.users if user.username == username), None)

    def get_by_id(self, user_id: int) -> User | None:
        return next((user for user in self.users if user.id == user_id), None)

    def count_active_admins(self) -> int:
        return sum(user.role == "admin" and user.is_active for user in self.users)

    def add(self, user: User) -> User:
        user.id = max((item.id for item in self.users), default=0) + 1
        self.users.append(user)
        return user

    def commit(self) -> None:
        self.commits += 1

    def rollback(self) -> None:
        pass


def service(users: list[User]) -> AdminUserService:
    return AdminUserService(FakeUserRepository(users))  # type: ignore[arg-type]


def test_create_user_hashes_password_with_argon2() -> None:
    admin = make_user(1, "lucky", role="admin")
    created = service([admin]).create_user(
        AdminUserCreate(
            username="anna",
            password="StrongPassword123!",
            nickname="Anna",
            role="user",
        )
    )

    assert created.password_hash.startswith("$argon2")
    assert verify_password("StrongPassword123!", created.password_hash)
    assert created.role == "user"
    assert created.is_active is True


def test_create_user_rejects_duplicate_username() -> None:
    existing = make_user(1, "anna")

    with pytest.raises(UsernameAlreadyExistsError):
        service([existing]).create_user(
            AdminUserCreate(
                username="anna",
                password="StrongPassword123!",
                nickname="Another Anna",
            )
        )


@pytest.mark.parametrize(
    "update",
    [
        AdminUserUpdate(role="user"),
        AdminUserUpdate(is_active=False),
    ],
)
def test_admin_cannot_remove_own_access(update: AdminUserUpdate) -> None:
    admin = make_user(1, "lucky", role="admin")

    with pytest.raises(SelfProtectionError):
        service([admin]).update_user(admin.id, update, admin)


def test_last_active_admin_is_protected() -> None:
    current_admin = make_user(1, "lucky", role="admin")
    last_admin = make_user(2, "maki", role="admin")
    current_admin.is_active = False

    with pytest.raises(LastActiveAdminError):
        service([current_admin, last_admin]).update_user(
            last_admin.id,
            AdminUserUpdate(is_active=False),
            current_admin,
        )


def test_admin_can_update_another_user() -> None:
    admin = make_user(1, "lucky", role="admin")
    member = make_user(2, "anna")

    updated = service([admin, member]).update_user(
        member.id,
        AdminUserUpdate(nickname="Anna Li", role="admin"),
        admin,
    )

    assert updated.nickname == "Anna Li"
    assert updated.role == "admin"
