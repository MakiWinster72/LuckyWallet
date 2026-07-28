from datetime import datetime, timezone

from app.models import User
from app.schemas.admin_user import AdminUserRead


def test_admin_user_read_exposes_avatar_url() -> None:
    now = datetime.now(timezone.utc)
    user = User(
        id=7,
        username="anna",
        nickname="Anna",
        password_hash="stored",
        avatar_url="/uploads/anna.png",
        role="user",
        is_active=True,
        created_at=now,
        updated_at=now,
    )

    response = AdminUserRead.model_validate(user)

    assert response.avatar_url == "/uploads/anna.png"
