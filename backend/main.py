from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any
import json
import os

app = FastAPI(title="Созвездия API", version="5.0")

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

# Календарь созвездий на весь год (с 1 января по 31 декабря)
DEFAULT_ZODIAC_DATES = [
    {"name": "Козерог", "latin": "Capricornus", "season": "Зима", "startMonth": 12, "startDay": 22, "endMonth": 1, "endDay": 19},
    {"name": "Водолей", "latin": "Aquarius", "season": "Зима", "startMonth": 1, "startDay": 20, "endMonth": 2, "endDay": 18},
    {"name": "Рыбы", "latin": "Pisces", "season": "Весна", "startMonth": 2, "startDay": 19, "endMonth": 3, "endDay": 20},
    {"name": "Овен", "latin": "Aries", "season": "Весна", "startMonth": 3, "startDay": 21, "endMonth": 4, "endDay": 19},
    {"name": "Телец", "latin": "Taurus", "season": "Весна", "startMonth": 4, "startDay": 20, "endMonth": 5, "endDay": 20},
    {"name": "Близнецы", "latin": "Gemini", "season": "Лето", "startMonth": 5, "startDay": 21, "endMonth": 6, "endDay": 20},
    {"name": "Рак", "latin": "Cancer", "season": "Лето", "startMonth": 6, "startDay": 21, "endMonth": 7, "endDay": 22},
    {"name": "Лев", "latin": "Leo", "season": "Лето", "startMonth": 7, "startDay": 23, "endMonth": 8, "endDay": 22},
    {"name": "Дева", "latin": "Virgo", "season": "Осень", "startMonth": 8, "startDay": 23, "endMonth": 9, "endDay": 22},
    {"name": "Весы", "latin": "Libra", "season": "Осень", "startMonth": 9, "startDay": 23, "endMonth": 10, "endDay": 22},
    {"name": "Скорпион", "latin": "Scorpius", "season": "Осень", "startMonth": 10, "startDay": 23, "endMonth": 11, "endDay": 21},
    {"name": "Стрелец", "latin": "Sagittarius", "season": "Зима", "startMonth": 11, "startDay": 22, "endMonth": 12, "endDay": 21},
]


def get_season_by_month(month: int) -> str:
    if month in (12, 1, 2):
        return "Зима"
    if month in (3, 4, 5):
        return "Весна"
    if month in (6, 7, 8):
        return "Лето"
    return "Осень"


def is_date_in_range(month: int, day: int, sm: int, sd: int, em: int, ed: int) -> bool:
    if sm <= em:
        return (month > sm or (month == sm and day >= sd)) and (month < em or (month == em and day <= ed))
    return (month > sm or (month == sm and day >= sd)) or (month < em or (month == em and day <= ed))


def require_admin(x_user_role: Optional[str] = Header(default="guest")):
    if x_user_role != "admin":
        raise HTTPException(status_code=403, detail="Доступ запрещён: требуются права администратора")


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


# --- Модели данных ---
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    secret_key: Optional[str] = ""


class UserLogin(BaseModel):
    email: str
    password: str


class ConstellationModel(BaseModel):
    name: str
    latin: str
    description: str
    season: Optional[str] = "Зима"
    startMonth: Optional[int] = 1
    startDay: Optional[int] = 1
    endMonth: Optional[int] = 12
    endDay: Optional[int] = 31
    stars: Optional[List[Any]] = []
    lines: Optional[List[Any]] = []


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


class ProgressModel(BaseModel):
    email: str
    favorites: List[int] = []
    studied: List[int] = []


# --- Созвездия и поиск по дате ---
@app.get("/api/constellations")
def get_constellations():
    return load_json(DATA_PATH)


@app.get("/api/constellations/by-date")
def get_constellation_by_date(month: int, day: int):
    if not (1 <= month <= 12) or not (1 <= day <= 31):
        raise HTTPException(status_code=400, detail="Некорректная дата")

    items = load_json(DATA_PATH)
    season_name = get_season_by_month(month)

    for c in items:
        if "startMonth" in c and "endMonth" in c:
            if is_date_in_range(
                month,
                day,
                int(c.get("startMonth", 1)),
                int(c.get("startDay", 1)),
                int(c.get("endMonth", 12)),
                int(c.get("endDay", 31)),
            ):
                return {**c, "matchedSeason": season_name}

    matched_zodiac = next(
        (z for z in DEFAULT_ZODIAC_DATES if is_date_in_range(month, day, z["startMonth"], z["startDay"], z["endMonth"], z["endDay"])),
        DEFAULT_ZODIAC_DATES[0],
    )

    existing = next((c for c in items if c.get("name", "").lower() == matched_zodiac["name"].lower()), None)
    if existing:
        return {**existing, "season": existing.get("season") or season_name, "matchedSeason": season_name}

    seasonal_items = [c for c in items if c.get("season") == season_name]
    base_item = seasonal_items[0] if seasonal_items else (items[0] if items else None)

    if base_item:
        return {
            **base_item,
            "dateConstellationName": matched_zodiac["name"],
            "dateConstellationLatin": matched_zodiac["latin"],
            "matchedSeason": season_name,
        }

    return {
        "id": 0,
        "name": matched_zodiac["name"],
        "latin": matched_zodiac["latin"],
        "season": season_name,
        "matchedSeason": season_name,
        "description": f"Созвездие периода {day}.{month:02d} (сезон: {season_name}).",
        "stars": [],
        "lines": [],
    }


@app.post("/api/constellations", dependencies=[Depends(require_admin)])
def add_constellation(item: ConstellationModel):
    items = load_json(DATA_PATH)
    existing_ids = []
    for i in items:
        try:
            existing_ids.append(int(i.get("id", 0)))
        except (ValueError, TypeError):
            pass
    new_id = max(existing_ids, default=0) + 1
    new_item = item.dict()
    new_item["id"] = new_id
    items.append(new_item)
    save_json(DATA_PATH, items)
    return {"message": "Созвездие добавлено", "item": new_item}


@app.put("/api/constellations/{item_id}", dependencies=[Depends(require_admin)])
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


@app.delete("/api/constellations/{item_id}", dependencies=[Depends(require_admin)])
def delete_constellation(item_id: int):
    items = load_json(DATA_PATH)
    new_items = [c for c in items if c.get("id") != item_id]
    save_json(DATA_PATH, new_items)
    return {"message": "Созвездие удалено"}


# --- Викторина и лидерборд ---
@app.get("/api/quiz")
def get_quiz():
    return load_json(QUIZ_PATH)


@app.post("/api/quiz", dependencies=[Depends(require_admin)])
def add_quiz(q: QuizQuestion):
    quiz = load_json(QUIZ_PATH)
    existing_ids = []
    for i in quiz:
        try:
            existing_ids.append(int(i.get("id", 0)))
        except (ValueError, TypeError):
            pass
    new_id = max(existing_ids, default=0) + 1
    new_q = {"id": new_id, **q.dict()}
    quiz.append(new_q)
    save_json(QUIZ_PATH, quiz)
    return {"message": "Вопрос добавлен", "item": new_q}


@app.put("/api/quiz/{q_id}", dependencies=[Depends(require_admin)])
def update_quiz(q_id: int, q: QuizQuestion):
    quiz = load_json(QUIZ_PATH)
    for item in quiz:
        if item.get("id") == q_id:
            item["question"] = q.question
            item["options"] = q.options
            item["answer"] = q.answer
            save_json(QUIZ_PATH, quiz)
            return {"message": "Вопрос обновлён"}
    raise HTTPException(status_code=404, detail="Вопрос не найден")


@app.delete("/api/quiz/{q_id}", dependencies=[Depends(require_admin)])
def delete_quiz(q_id: int):
    quiz = load_json(QUIZ_PATH)
    new_quiz = [item for item in quiz if item.get("id") != q_id]
    save_json(QUIZ_PATH, new_quiz)
    return {"message": "Вопрос удалён"}


@app.post("/api/quiz/score")
def save_score(data: ScoreModel):
    users = load_json(USERS_PATH)
    for u in users:
        if u.get("email") == data.email:
            if data.score > u.get("score", 0):
                u["score"] = data.score
            save_json(USERS_PATH, users)
            return {"message": "Счёт обновлён"}
    raise HTTPException(status_code=404, detail="Пользователь не найден")


@app.get("/api/quiz/leaderboard")
def leaderboard():
    users = load_json(USERS_PATH)
    sorted_users = sorted(users, key=lambda x: x.get("score", 0), reverse=True)
    return [{"username": u.get("username"), "score": u.get("score", 0)} for u in sorted_users[:5]]


# --- Пользователи, прогресс и заметки ---
@app.get("/api/users")
def get_users():
    users = load_json(USERS_PATH)
    return [
        {
            "id": u.get("id"),
            "username": u.get("username"),
            "email": u.get("email"),
            "role": u.get("role", "user"),
            "score": u.get("score", 0),
        }
        for u in users
    ]


@app.post("/api/users/progress")
def update_progress(data: ProgressModel):
    users = load_json(USERS_PATH)
    for u in users:
        if u.get("email") == data.email:
            u["favorites"] = data.favorites
            u["studied"] = data.studied
            save_json(USERS_PATH, users)
            return {"message": "Прогресс сохранён", "user": u}
    raise HTTPException(status_code=404, detail="Пользователь не найден")


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
        "favorites": [],
        "studied": [],
    }
    users.append(new_user)
    save_json(USERS_PATH, users)
    return {"message": "Регистрация успешна", "user": new_user}


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