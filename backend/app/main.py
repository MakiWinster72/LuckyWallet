from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.api.routes.auth import router as auth_router
from app.api.routes.admin_users import router as admin_users_router
from app.api.routes.bills import router as bills_router
from app.api.routes.members import router as members_router
from app.api.routes.statistics import router as statistics_router
from app.api.routes.claude_code import router as claude_code_router
from app.api.routes.settings import router as settings_router
from app.config import get_settings
from app.database import engine


settings = get_settings()
uploads_dir = Path(__file__).resolve().parents[2] / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(application: FastAPI):
    del application
    yield


app = FastAPI(
    title="LuckyWallet API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(admin_users_router, prefix="/api/v1")
app.include_router(bills_router, prefix="/api/v1")
app.include_router(members_router, prefix="/api/v1")
app.include_router(statistics_router, prefix="/api/v1")
app.include_router(settings_router, prefix="/api/v1")
app.include_router(claude_code_router, prefix="/api/v1")
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/health")
def health() -> dict[str, str]:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ok"}
