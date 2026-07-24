from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hash_round_trip() -> None:
    stored_hash = hash_password("StrongPassword123!")

    assert stored_hash != "StrongPassword123!"
    assert verify_password("StrongPassword123!", stored_hash)
    assert not verify_password("wrong-password", stored_hash)


def test_access_token_round_trip() -> None:
    token = create_access_token(42)

    assert decode_access_token(token) == 42
