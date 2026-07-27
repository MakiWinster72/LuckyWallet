from pydantic import BaseModel, ConfigDict


class MemberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    nickname: str | None
