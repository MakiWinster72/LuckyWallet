from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.models import User
from app.repositories.user_repository import UserRepository
from app.schemas.member import MemberRead
from app.services.member_service import MemberService


router = APIRouter(prefix="/members", tags=["成员"])


@router.get("", response_model=list[MemberRead])
def list_members(db: DbSession, current_user: CurrentUser) -> list[User]:
    del current_user
    return MemberService(UserRepository(db)).list_active_members()
