from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from .db import db

SECRET_KEY = "nyaya_super_secret_key_change_this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

users_collection = db["users"]

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def register_user(username: str, password: str):
    username = username.strip().lower()

    existing_user = users_collection.find_one({"username": username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    user = {
        "username": username,
        "hashed_password": hash_password(password),
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    users_collection.insert_one(user)

    return {"message": "User registered successfully"}


def authenticate_user(username: str, password: str):
    username = username.strip().lower()

    user = users_collection.find_one({"username": username})
    if not user:
        return None

    if not verify_password(password, user["hashed_password"]):
        return None

    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def login_user(username: str, password: str):
    user = authenticate_user(username, password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    access_token = create_access_token({"sub": user["username"]})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user["username"],
    }