from app.models import User
from app.repositories.user_repository import UserRepository


class MemberService:
    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    def list_active_members(self) -> list[User]:
        return self.repository.list_active()
