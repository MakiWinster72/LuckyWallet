from unittest.mock import Mock, patch

from app.runtime_schema import ensure_user_avatar_column


def test_adds_avatar_column_for_an_existing_database() -> None:
    connection = Mock()
    inspector = Mock()
    inspector.get_columns.return_value = [{"name": "id"}, {"name": "nickname"}]

    with patch("app.runtime_schema.inspect", return_value=inspector):
        changed = ensure_user_avatar_column(connection)

    assert changed is True
    connection.execute.assert_called_once()
    statement = connection.execute.call_args.args[0]
    assert str(statement) == (
        "ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL AFTER nickname"
    )


def test_leaves_an_up_to_date_database_unchanged() -> None:
    connection = Mock()
    inspector = Mock()
    inspector.get_columns.return_value = [{"name": "id"}, {"name": "avatar_url"}]

    with patch("app.runtime_schema.inspect", return_value=inspector):
        changed = ensure_user_avatar_column(connection)

    assert changed is False
    connection.execute.assert_not_called()
