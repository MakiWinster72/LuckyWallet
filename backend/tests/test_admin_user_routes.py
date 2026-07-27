from fastapi import HTTPException
from fastapi.testclient import TestClient
import pytest

from app.api.deps import get_current_user, require_admin
from app.main import app
from app.models import User


def user_with_role(role: str) -> User:
    return User(
        id=7,
        username="member",
        nickname="Member",
        password_hash="stored",
        role=role,
        is_active=True,
    )


def test_require_admin_rejects_regular_user() -> None:
    with pytest.raises(HTTPException) as raised:
        require_admin(user_with_role("user"))

    assert raised.value.status_code == 403
    assert raised.value.detail["code"] == "ADMIN_REQUIRED"


def test_admin_users_endpoint_returns_403_for_regular_user() -> None:
    app.dependency_overrides[get_current_user] = lambda: user_with_role("user")
    try:
        response = TestClient(app).get("/api/v1/admin/users")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "ADMIN_REQUIRED"
