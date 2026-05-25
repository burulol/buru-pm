from fastapi import FastAPI
from app.routers import auth, platforms
from app.models import user, session, entry

app = FastAPI()
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(platforms.router, prefix="/platforms", tags=["platforms"])
