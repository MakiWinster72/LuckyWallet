from fastapi import APIRouter, HTTPException, status

from app.api.deps import AdminUser, DbSession
from app.models import User
from app.repositories.user_repository import UserRepository
from app.schemas.admin_user import AdminUserCreate, AdminUserRead, AdminUserUpdate
from app.services.admin_user_service import (
    AdminUserService,
    LastActiveAdminError,
    SelfProtectionError,
    UsernameAlreadyExistsError,
    UserNotFoundError,
)


router = APIRouter(prefix="/admin/users", tags=["管理员用户"])


def get_service(db: DbSession) -> AdminUserService:
    return AdminUserService(UserRepository(db))


def conflict(code: str, message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail={"code": code, "message": message},
    )


@router.get("", response_model=list[AdminUserRead])
def list_users(db: DbSession, current_admin: AdminUser) -> list[User]:
    del current_admin
    return get_service(db).list_users()


@router.post(
    "",
    response_model=AdminUserRead,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    data: AdminUserCreate,
    db: DbSession,
    current_admin: AdminUser,
) -> User:
    del current_admin
    try:
        return get_service(db).create_user(data)
    except UsernameAlreadyExistsError:
        raise conflict("USERNAME_EXISTS", "用户名已存在") from None


@router.patch("/{user_id}", response_model=AdminUserRead)
def update_user(
    user_id: int,
    data: AdminUserUpdate,
    db: DbSession,
    current_admin: AdminUser,
) -> User:
    try:
        return get_service(db).update_user(user_id, data, current_admin)
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "USER_NOT_FOUND", "message": "用户不存在"},
        ) from None
    except SelfProtectionError:
        raise conflict("SELF_PROTECTION", "不能停用自己或移除自己的管理员角色") from None
    except LastActiveAdminError:
        raise conflict("LAST_ACTIVE_ADMIN", "必须保留至少一名启用的管理员") from None
