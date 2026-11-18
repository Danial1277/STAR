from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os

app = FastAPI(title="Созвездия API - Full Admin Control", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/constellations.json")
USERS_PATH = os.path.join(os.path.dirname(__file__), "../data/users.json")
QUIZ_PATH = os.path.join(os.path.dirname(__file__), "../data/quiz.json")
NOTES_PATH = os.path.join(os.path.dirname(__file__), "../data/notes.json")

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

# --- Модели Pydantic ---
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    secret_key: str = ""

class UserLogin(BaseModel):
    email: str
    password: str

class ConstellationModel(BaseModel):
    name: str
    latin: str
    description: str
    season: str
    startMonth: int = 1
    startDay: int = 1
    endMonth: int = 12
    endDay: int = 31
    stars: list = []
    lines: list = []

class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    answer: str

class NoteModel(BaseModel):
    email: str
    title: str
    content: str

class ScoreModel(BaseModel):
    email: str
    score: int

# --- Эндпоинты Созвездий и Карты ---
@app.get("/api/constellations")
def get_constellations():
    return load_json(DATA_PATH)

@app.get("/api/constellations/by-date")
def get_constellation_by_date(month: int, day: int):
    items = load_json(DATA_PATH)
    if not items:
        raise HTTPException(status_code=404, detail="База созвездий пуста")
    
    for c in items:
        sm = c.get("startMonth", 1)
        sd = c.get("startDay", 1)
        em = c.get("endMonth", 12)
        ed = c.get("endDay", 31)
        
        match = False
        if sm <= em:
            if (month > sm or (month == sm and day >= sd)) and (month < em or (month == em and day <= ed)):
                match = True
        else:
            if (month > sm or (month == sm and day >= sd)) or (month < em or (month == em and day <= ed)):
                match = True
        if match:
            return c
            
    return items[0]

@app.post("/api/constellations")
def add_constellation(item: ConstellationModel):
    items = load_json(DATA_PATH)
    
    # Безопасно преобразуем все существующие id в int, чтобы избежать ошибок с 'str'
    existing_ids = []
    for i in items:
        val = i.get("id", 0)
        try:
            existing_ids.append(int(val))
        except (ValueError, TypeError):
            pass
            
    new_id = max(existing_ids, default=0) + 1
    
    new_item = item.dict()
    new_item["id"] = new_id
    items.append(new_item)
    save_json(DATA_PATH, items)
    return {"message": "Созвездие добавлено", "item": new_item}

@app.put("/api/constellations/{item_id}")
def update_constellation(item_id: int, item: ConstellationModel):
    items = load_json(DATA_PATH)
    for c in items:
        if c.get("id") == item_id:
            updated_data = item.dict()
            updated_data["id"] = item_id
            c.update(updated_data)
            save_json(DATA_PATH, items)
            return {"message": "Созвездие и карта обновлены"}
    raise HTTPException(status_code=404, detail="Созвездие не найдено")

@app.delete("/api/constellations/{item_id}")
def delete_constellation(item_id: int):
    items = load_json(DATA_PATH)
    new_items = [c for c in items if c.get("id") != item_id]
    save_json(DATA_PATH, new_items)
    return {"message": "Созвездие удалено"}

# --- Эндпоинты Викторины (CRUD) ---
@app.get("/api/quiz")
def get_quiz():
    return load_json(QUIZ_PATH)

@app.post("/api/quiz")
def add_quiz(q: QuizQuestion):
    quiz = load_json(QUIZ_PATH)
    new_id = max([i.get("id", 0) for i in quiz], default=0) + 1
    new_q = {"id": new_id, **q.dict()}
    quiz.append(new_q)
    save_json(QUIZ_PATH, quiz)
    return {"message": "Вопрос добавлен", "item": new_q}

@app.put("/api/quiz/{q_id}")
def update_quiz(q_id: int, q: QuizQuestion):
    quiz = load_json(QUIZ_PATH)
    for item in quiz:
        if item.get("id") == q_id:
            item["question"] = q.question
            item["options"] = q.options
            item["answer"] = q.answer
            save_json(QUIZ_PATH, quiz)
            return {"message": "Вопрос обновлен"}
    raise HTTPException(status_code=404, detail="Вопрос не найден")

@app.delete("/api/quiz/{q_id}")
def delete_quiz(q_id: int):
    quiz = load_json(QUIZ_PATH)
    new_quiz = [item for item in quiz if item.get("id") != q_id]
    save_json(QUIZ_PATH, new_quiz)
    return {"message": "Вопрос удален"}

@app.post("/api/quiz/score")
def save_score(data: ScoreModel):
    users = load_json(USERS_PATH)
    for u in users:
        if u.get("email") == data.email:
            if data.score > u.get("score", 0):
                u["score"] = data.score
            save_json(USERS_PATH, users)
            return {"message": "Счет обновлен"}
    raise HTTPException(status_code=404, detail="Пользователь не найден")

@app.get("/api/quiz/leaderboard")
def leaderboard():
    users = load_json(USERS_PATH)
    sorted_users = sorted(users, key=lambda x: x.get("score", 0), reverse=True)
    return [{"username": u.get("username"), "score": u.get("score", 0)} for u in sorted_users[:5]]

# --- Пользователи и Заметки ---
@app.get("/api/users")
def get_users():
    users = load_json(USERS_PATH)
    return [{"id": u.get("id"), "username": u.get("username"), "email": u.get("email"), "role": u.get("role", "user"), "score": u.get("score", 0)} for u in users]

@app.post("/api/auth/register")
def register(user: UserRegister):
    users = load_json(USERS_PATH)
    if any(u["email"] == user.email for u in users):
        raise HTTPException(status_code=400, detail="Email уже занят")
    role = "admin" if user.secret_key == "ADMIN2026" else "user"
    new_user = {
        "id": len(users) + 1,
        "username": user.username,
        "email": user.email,
        "password": user.password,
        "role": role,
        "score": 0,
        "completed": []
    }
    users.append(new_user)
    save_json(USERS_PATH, users)
    return {"message": "Успешно", "user": new_user}

@app.post("/api/auth/login")
def login(user: UserLogin):
    users = load_json(USERS_PATH)
    found = next((u for u in users if u["email"] == user.email and u["password"] == user.password), None)
    if not found:
        raise HTTPException(status_code=400, detail="Неверные данные")
    return {"message": "Вход выполнен", "user": found}

@app.get("/api/notes")
def get_notes(email: str):
    notes = load_json(NOTES_PATH)
    return [n for n in notes if n.get("email") == email]

@app.post("/api/notes")
def add_note(note: NoteModel):
    notes = load_json(NOTES_PATH)
    new_note = {"id": len(notes) + 1, **note.dict()}
    notes.append(new_note)
    save_json(NOTES_PATH, notes)
    return {"message": "Заметка сохранена", "note": new_note}