from fastapi.testclient import TestClient

from app.api.deps import get_current_user
from app.api.routes import auth
from app.database import get_db
from app.main import app
from app.models import User


class FakeSession:
    def commit(self) -> None:
        pass

    def refresh(self, user: User) -> None:
        pass


def current_user() -> User:
    return User(
        id=7,
        username="maki",
        nickname="MakiWinster",
        avatar_url=None,
        password_hash="stored",
        role="user",
        is_active=True,
    )


def test_upload_avatar_saves_file_and_updates_user(tmp_path, monkeypatch) -> None:
    user = current_user()
    monkeypatch.setattr(auth, "UPLOAD_DIR", tmp_path)
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db] = lambda: FakeSession()
    try:
        response = TestClient(app).post(
            "/api/v1/auth/me/avatar",
            files={"avatar": ("portrait.png", b"fake-png-content", "image/png")},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["avatar_url"].startswith("/uploads/avatar-7-")
    assert len(list(tmp_path.glob("avatar-7-*.png"))) == 1


def test_upload_avatar_rejects_unsupported_files(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(auth, "UPLOAD_DIR", tmp_path)
    app.dependency_overrides[get_current_user] = current_user
    app.dependency_overrides[get_db] = lambda: FakeSession()
    try:
        response = TestClient(app).post(
            "/api/v1/auth/me/avatar",
            files={"avatar": ("avatar.gif", b"gif", "image/gif")},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 415
    assert response.json()["detail"]["code"] == "INVALID_AVATAR_TYPE"
    assert list(tmp_path.iterdir()) == []
