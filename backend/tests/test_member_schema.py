from types import SimpleNamespace

from app.schemas.member import MemberRead


def test_member_response_includes_uploaded_avatar() -> None:
    member = MemberRead.model_validate(SimpleNamespace(
        id=7,
        username="lucky",
        nickname="Lucky",
        avatar_url="/uploads/avatar-7.png",
    ))

    assert member.avatar_url == "/uploads/avatar-7.png"
