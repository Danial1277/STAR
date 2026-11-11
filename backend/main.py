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
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в API проекта «Созвездия»! ✨"}

@app.get("/api/constellations")
def get_constellations():
    return load_json(DATA_PATH)

# Поиск созвездия по дате
@app.get("/api/constellations/by-date")
def get_constellation_by_date(month: int, day: int):
    items = load_json(DATA_PATH)
    if not items:
        raise HTTPException(status_code=404, detail="Данные не найдены")
    
    if (month == 11 and day >= 21) or (month == 12 and day <= 20):
        item = next((c for c in items if c["id"] == "orion"), items[0])
    else:
        item = next((c for c in items if c["id"] == "ursa-major"), items[0])
        
    return item

# --- АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ ---

@app.post("/api/auth/register")
def register(user: UserRegister):
    users = load_json(USERS_PATH)
    if any(u["email"] == user.email for u in users):
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    
    new_user = {
        "id": len(users) + 1,
        "username": user.username,
        "email": user.email,
        "password": user.password,
        "role": "user"
    }
    users.append(new_user)
    save_json(USERS_PATH, users)
    return {"message": "Регистрация успешна!", "user": {"username": new_user["username"], "email": new_user["email"]}}

@app.post("/api/auth/login")
def login(user: UserLogin):
    users = load_json(USERS_PATH)
    found_user = next((u for u in users if u["email"] == user.email and u["password"] == user.password), None)
    if not found_user:
        raise HTTPException(status_code=400, detail="Неверный email или пароль")
    
    return {"message": "Вход выполнен успешно!", "user": {"username": found_user["username"], "email": found_user["email"], "role": found_user["role"]}}