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

# Пути к файлам данных в корневой папке проекта
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/constellations.json")
USERS_PATH = os.path.join(os.path.dirname(__file__), "../data/users.json")
QUIZ_PATH = os.path.join(os.path.dirname(__file__), "../data/quiz.json")

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
    secret_key: str = ""

class UserLogin(BaseModel):
    email: str
    password: str

class ConstellationCreate(BaseModel):
    name: str
    latin: str
    description: str
    season: str

class QuizQuestionCreate(BaseModel):
    question: str
    options: list[str]
    answer: str

@app.get("/api/constellations")
def get_constellations():
    return load_json(DATA_PATH)

@app.post("/api/constellations")
def add_constellation(item: ConstellationCreate):
    items = load_json(DATA_PATH)
    new_item = {
        "id": len(items) + 1,
        "name": item.name,
        "latin": item.latin,
        "description": item.description,
        "season": item.season,
        "stars": []
    }
    items.append(new_item)
    save_json(DATA_PATH, items)
    return {"message": "Созвездие успешно добавлено!", "item": new_item}

@app.get("/api/quiz")
def get_quiz():
    return load_json(QUIZ_PATH)

@app.post("/api/quiz")
def add_quiz_question(q: QuizQuestionCreate):
    questions = load_json(QUIZ_PATH)
    new_q = {
        "id": len(questions) + 1,
        "question": q.question,
        "options": q.options,
        "answer": q.answer
    }
    questions.append(new_q)
    save_json(QUIZ_PATH, questions)
    return {"message": "Вопрос викторины успешно добавлен!", "item": new_q}

@app.post("/api/auth/register")
def register(user: UserRegister):
    users = load_json(USERS_PATH)
    if any(u["email"] == user.email for u in users):
        raise HTTPException(status_code=400, detail="Этот email уже занят")
    
    # Если введен секретный ключ "ADMIN2026", выдаем роль admin, иначе user
    assigned_role = "admin" if user.secret_key == "ADMIN2026" else "user"
    
    new_user = {
        "id": len(users) + 1,
        "username": user.username,
        "email": user.email,
        "password": user.password,
        "role": assigned_role
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
    found_user = next((u for u in users if u["email"] == user.email and u["password"] == user.password), None)
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