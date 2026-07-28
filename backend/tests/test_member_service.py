from dataclasses import dataclass

from app.services.member_service import MemberService


@dataclass
class FakeUser:
    id: int
    username: str
    nickname: str | None


class FakeRepository:
    def list_active(self) -> list[FakeUser]:
        return [FakeUser(id=1, username="lucky", nickname="Lucky")]


def test_list_members_delegates_to_active_user_query() -> None:
    result = MemberService(FakeRepository()).list_active_members()
    assert [user.username for user in result] == ["lucky"]
