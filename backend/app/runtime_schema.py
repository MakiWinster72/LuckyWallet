from sqlalchemy import Connection, inspect, text


def ensure_user_avatar_column(connection: Connection) -> bool:
    """Bring databases created before profile avatars up to the current schema."""
    columns = {
        column["name"]
        for column in inspect(connection).get_columns("users")
    }
    if "avatar_url" in columns:
        return False

    connection.execute(
        text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL AFTER nickname"),
    )
    return True
