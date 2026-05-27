from fastapi import FastAPI
from app.routers import auth, platforms, passwords
from app.models import user, session, entry
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(platforms.router, prefix="/platforms", tags=["platforms"])
app.include_router(passwords.router, prefix="/passwords", tags=["passwords"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
