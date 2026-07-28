from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status

from app.api.deps import CurrentUser, DbSession
from app.config import get_settings
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    UserResponse,
)
from app.services.auth_service import (
    AuthService,
    CurrentPasswordIncorrectError,
    InvalidCredentialsError,
)


router = APIRouter(prefix="/auth", tags=["认证"])
UPLOAD_DIR = Path(__file__).resolve().parents[4] / "uploads"
ALLOWED_AVATAR_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_AVATAR_SIZE = 5 * 1024 * 1024


@router.post(
    "/login",
    response_model=LoginResponse,
    responses={401: {"description": "用户名或密码错误"}},
)
def login(
    data: LoginRequest,
    request: Request,
    db: DbSession,
) -> LoginResponse:
    service = AuthService(UserRepository(db))
    try:
        user, access_token = service.login(
            username=data.username,
            password=data.password,
            ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
    except InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": "用户名或密码错误",
            },
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    settings = get_settings()
    return LoginResponse(
        access_token=access_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.post("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    data: ChangePasswordRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    try:
        AuthService(UserRepository(db)).change_password(
            user=current_user,
            current_password=data.current_password,
            new_password=data.new_password,
        )
    except CurrentPasswordIncorrectError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "CURRENT_PASSWORD_INCORRECT",
                "message": "当前密码不正确",
            },
        ) from None


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    db: DbSession,
    current_user: CurrentUser,
    avatar: UploadFile = File(...),
) -> UserResponse:
    suffix = ALLOWED_AVATAR_TYPES.get(avatar.content_type or "")
    if suffix is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail={"code": "INVALID_AVATAR_TYPE", "message": "仅支持 JPG、PNG 或 WebP 图片"},
        )

    content = await avatar.read(MAX_AVATAR_SIZE + 1)
    if len(content) > MAX_AVATAR_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={"code": "AVATAR_TOO_LARGE", "message": "头像大小不能超过 5 MB"},
        )
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "EMPTY_AVATAR", "message": "请选择有效的头像图片"},
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"avatar-{current_user.id}-{uuid4().hex}{suffix}"
    (UPLOAD_DIR / filename).write_bytes(content)
    previous_avatar = current_user.avatar_url
    current_user.avatar_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(current_user)

    if previous_avatar and previous_avatar.startswith("/uploads/"):
        previous_path = UPLOAD_DIR / Path(previous_avatar).name
        previous_path.unlink(missing_ok=True)

    return UserResponse.model_validate(current_user)
