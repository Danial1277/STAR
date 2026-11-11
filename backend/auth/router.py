from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["Auth"])
fake_users_db = {}

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(user: UserRegister):
    if user.email in fake_users_db:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    fake_users_db[user.email] = user.dict()
    return {"message": "Успешная регистрация", "user": user.username}

@router.post("/login")
def login(user: UserLogin):
    db_user = fake_users_db.get(user.email)
    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    return {"access_token": f"token-for-{db_user['username']}", "token_type": "bearer"}