from fastapi import FastAPI
from app.routers import auth
from app.models import user, session

app = FastAPI()
app.include_router(auth.router, prefix="/auth", tags=["auth"])
