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


def ensure_household_settings_table(connection: Connection) -> bool:
    """Add persisted household settings to databases created before the feature."""
    if "household_settings" in inspect(connection).get_table_names():
        return False

    connection.execute(
        text(
            """
            CREATE TABLE household_settings (
              id INT NOT NULL,
              monthly_budget DECIMAL(10,2) NOT NULL DEFAULT 2400.00,
              PRIMARY KEY (id),
              CONSTRAINT ck_household_settings_budget_positive
                CHECK (monthly_budget > 0)
            ) ENGINE=InnoDB
            """,
        ),
    )
    return True
