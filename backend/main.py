from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os

app = FastAPI(title="Созвездия API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/constellations.json")
USERS_PATH = os.path.join(os.path.dirname(__file__), "../data/users.json")

def load_json(path):
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump([], f)
        return []
    with open(path, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@app.get("/api/constellations")
def get_constellations():
    return load_json(DATA_PATH)

@app.post("/api/auth/register")
def register(user: UserRegister):
    users = load_json(USERS_PATH)
    if any(u["email"] == user.email for u in users):
        raise HTTPException(status_code=400, detail="Этот email уже занят")
    
    # Все новые пользователи получают роль "user" по умолчанию (безопасно)
    new_user = {
        "id": len(users) + 1,
        "username": user.username,
        "email": user.email,
        "password": user.password,
        "role": "user"
    }
    users.append(new_user)
    save_json(USERS_PATH, users)
    return {
        "message": "Регистрация успешна!",
        "user": {
            "username": new_user["username"],
            "email": new_user["email"],
            "role": new_user["role"]
        }
    }

@app.post("/api/auth/login")
def login(user: UserLogin):
    users = load_json(USERS_PATH)
    found_user = next(
        (u for u in users if u["email"] == user.email and u["password"] == user.password),
        None
    )
    if not found_user:
        raise HTTPException(status_code=400, detail="Неверный email или пароль")
    
    return {
        "message": "Вход выполнен!",
        "user": {
            "username": found_user["username"],
            "email": found_user["email"],
            "role": found_user.get("role", "user")
        }
    }