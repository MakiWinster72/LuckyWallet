from fastapi import APIRouter, HTTPException, Request, status

from app.api.deps import CurrentUser, DbSession
from app.config import get_settings
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse
from app.services.auth_service import AuthService, InvalidCredentialsError


router = APIRouter(prefix="/auth", tags=["认证"])


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
