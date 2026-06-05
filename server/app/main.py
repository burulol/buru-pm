from fastapi import FastAPI
from app.routers import auth, platforms, passwords
from app.models import user, session, entry
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.limiter import limiter

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(platforms.router, prefix="/platforms", tags=["platforms"])
app.include_router(passwords.router, prefix="/passwords", tags=["passwords"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
