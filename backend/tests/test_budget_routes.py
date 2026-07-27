from fastapi.testclient import TestClient

from app.api.deps import get_current_user
from app.main import app
from app.models import User


def regular_user() -> User:
    return User(
        id=8,
        username="member",
        nickname="Member",
        password_hash="stored",
        role="user",
        is_active=True,
    )


def test_regular_user_cannot_update_the_monthly_budget() -> None:
    app.dependency_overrides[get_current_user] = regular_user
    try:
        response = TestClient(app).put(
            "/api/v1/settings/budget",
            json={"monthly_budget": "3600.00"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "ADMIN_REQUIRED"
