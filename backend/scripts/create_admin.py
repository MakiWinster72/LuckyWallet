import argparse
from getpass import getpass

from sqlalchemy import select

from app.core.security import hash_password
from app.database import SessionLocal
from app.models import User


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create a LuckyWallet admin")
    parser.add_argument("--username", default="admin")
    parser.add_argument("--nickname", default="管理员")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    password = getpass("管理员密码: ")
    password_confirmation = getpass("再次输入密码: ")

    if password != password_confirmation:
        raise SystemExit("两次密码输入不一致")
    if len(password) < 8:
        raise SystemExit("密码至少需要 8 个字符")

    with SessionLocal() as session:
        existing_user = session.scalar(
            select(User).where(User.username == args.username),
        )
        if existing_user is not None:
            raise SystemExit(f"用户 {args.username} 已存在")

        user = User(
            username=args.username,
            password_hash=hash_password(password),
            nickname=args.nickname,
            role="admin",
            is_active=True,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        print(f"已创建管理员: {user.username} (id={user.id})")


if __name__ == "__main__":
    main()
