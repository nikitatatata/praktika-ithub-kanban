import logging
from logging.handlers import RotatingFileHandler
from fastapi import FastAPI, Response, UploadFile, File, Form, Query
from fastapi.staticfiles import StaticFiles
from commands import *
import shutil
from pathlib import Path

# 1. Настройка логгера
logger = logging.getLogger("fastapi_app")
logger.setLevel(logging.INFO)

# 2. Файловый обработчик (макс. 5 МБ, хранение 3 старых файлов)
file_handler = RotatingFileHandler(
    "app.log", maxBytes=5*1024*1024, backupCount=3, encoding="utf-8"
)
formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")
file_handler.setFormatter(formatter)

# 3. Добавляем обработчик к логгеру приложения и Uvicorn (для логов HTTP-запросов)
logger.addHandler(file_handler)
logging.getLogger("uvicorn").addHandler(file_handler)

# add_User("teto@teto.teto", "3t62gd7d2387", "nik", "tar", "admin", "serg", "Касане тето", "Москва")
# print(validate_User("teto@teto.teto", "3t62gd7d2387"))
#add_Animal("Cat", "Siamese", "Barsik", "Very fluffy and friendly", 2, 5000, True)

# # 1. Поиск всех животных без фильтров
# all_animals = get_Animals()
# print("Все животные:", all_animals)

# # 2. Поиск только по типу животного (например, ищем только котов)
# only_cats = get_Animals(Type="Cat")
# print("Все коты:", only_cats)

# # 3. Поиск по типу и породе (например, сиамские коты)
# siamese_cats = get_Animals(Type="Cat", Breed="Siamese")
# print("Сиамские коты:", siamese_cats)

# # 4. Поиск по возрасту и стерильности (например, ищем всех стерилизованных животных возраста 2 года)
# adult_sterilized = get_Animals(Age=2, Sterealized=True)
# print("Стерилизованные 2-х летние животные:", adult_sterilized)

# # 5. Поиск по всем доступным параметрам
# specific_search = get_Animals(Type="Dog", Breed="Corgi", Age=1, Sterealized=False)
# print("Точный поиск:", specific_search)

app = FastAPI()

# Создаем директорию для загрузок, если она не существует
UPLOADS_DIR = Path("./frontend/uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

@app.post("/api/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

@app.post("/api/register")
def register(
    Email: str = Form(...), 
    PasswordHash: str = Form(...), 
    Firstname: str = Form(...), 
    Surname: str = Form(...),
    Phone: str = Form(...),
    Lastname: str = Form(""),
    Description: str = Form(""),
    Location: str = Form("")
):
    user_id = add_User(Email, PasswordHash, Firstname, Surname, Phone, Lastname, Description, Location)
    if not user_id:
        # 409 Conflict - ресурс уже существует (или другая ошибка БД)
        return Response(content="false", status_code=409, media_type="application/json")
    return user_id

@app.post("/api/login")
def login(
    Email: str = Form(...), 
    PasswordHash: str = Form(...) 
):
    user_id = get_User_by_auth(Email, PasswordHash)
    if not user_id:
        # 403 Forbidden - доступ запрещен (неверные учетные данные)
        return Response(content="false", status_code=403, media_type="application/json")
    return user_id

@app.get("/api/animal")
def get_animal(
    Type: str = None,
    Breed: str = None,
    Age: int = None,
    Sterealized: bool = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    res = get_Animals(Type, Breed, Age, Sterealized, limit, offset)

    return res

@app.post("/api/animal")
async def create_animal(
    Type: str = Form(...),
    Breed: str = Form(...),
    Name: str = Form(...),
    Description: str = Form(...),
    OrientatedAge: int = Form(...),
    Cost: int = Form(...),
    Sterealized: bool = Form(...),
    image: UploadFile = File(...),
    Email: str = Form(...),
    PasswordHash: str = Form(...)
):
    # 1. Валидация пользователя
    user_id = get_User_by_auth(Email, PasswordHash)
    if not user_id:
        return Response(content='{"error": "Unauthorized"}', status_code=403, media_type="application/json")

    # Генерируем безопасный путь к файлу
    file_path = UPLOADS_DIR / image.filename
    
    # Сохраняем файл на диск
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
        
    # Путь для сохранения в БД и доступа с фронтенда
    image_path_for_db = f"/uploads/{image.filename}"

    # Добавляем запись о животном в базу данных, проверяя на дубликаты
    result = add_Animal(Type, Breed, Name, Description, OrientatedAge, Cost, Sterealized, image_path_for_db, OwnerID=user_id)
    
    if not result:
        return Response(content='{"error": "Animal with this name already exists"}', status_code=409, media_type="application/json")

    # Возвращаем успешный ответ, если животное было создано
    return {"message": "Animal created successfully", "image_path": image_path_for_db}

@app.get("/api/user/{user_id}/animals")
def get_user_animals(user_id: int, limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0)):
    return get_Animals_by_User(user_id, limit, offset)


@app.get("/api/animal/{animal_id}")
def get_single_animal(animal_id: int):
    animal = get_Animal_by_id(animal_id)
    if not animal:
        return Response(status_code=404, content='{"error": "Animal not found"}', media_type="application/json")
    return animal

@app.get("/api/user/{user_id}")
def get_user_profile(user_id: int):
    user = get_User_by_id(user_id)
    if not user:
        return Response(status_code=404, content='{"error": "User not found"}', media_type="application/json")
    return user

@app.put("/api/user")
def update_user_profile(
    Email: str = Form(...),
    PasswordHash: str = Form(...),
    Firstname: str = Form(...),
    Surname: str = Form(...),
    Phone: str = Form(...),
    Lastname: str = Form(""),
    Description: str = Form(""),
    Location: str = Form("")
):
    user_id = get_User_by_auth(Email, PasswordHash)
    if not user_id:
        return Response(content='{"error": "Unauthorized"}', status_code=403, media_type="application/json")
        
    success = update_User(user_id, Firstname, Surname, Phone, Lastname, Description, Location)
    if not success:
        return Response(content='{"error": "Failed to update profile"}', status_code=500, media_type="application/json")
        
    return {"message": "Profile updated successfully"}

@app.delete("/api/animal/{animal_id}")
def delete_animal(
    animal_id: int,
    Email: str = Form(...),
    PasswordHash: str = Form(...)
):
    user_id = get_User_by_auth(Email, PasswordHash)
    if not user_id:
        return Response(content='{"error": "Unauthorized"}', status_code=403, media_type="application/json")
        
    status = delete_Animal(animal_id, user_id)
    if status == 404:
        return Response(status_code=404, content='{"error": "Animal not found"}', media_type="application/json")
    elif status == 403:
        return Response(status_code=403, content='{"error": "Forbidden: You do not own this animal"}', media_type="application/json")
    
    return Response(status_code=204)

@app.post("/api/fundraiser")
async def create_new_fundraiser(
    Title: str = Form(...),
    TargetAmount: int = Form(...),
    Description: str = Form(...),
    image: UploadFile = File(...),
    AnimalID: int = Form(None),
    Email: str = Form(...),
    PasswordHash: str = Form(...)
):
    user_id = get_User_by_auth(Email, PasswordHash)
    if not user_id:
        return Response(content='{"error": "Unauthorized"}', status_code=403, media_type="application/json")

    file_path = UPLOADS_DIR / image.filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
        
    image_path_for_db = f"/uploads/{image.filename}"

    fundraiser = create_fundraiser(user_id, Title, TargetAmount, Description, image_path_for_db, AnimalID)
    if not fundraiser:
        return Response(content='{"error": "Failed to create fundraiser"}', status_code=500, media_type="application/json")
    
    return fundraiser

@app.get("/api/fundraisers")
def list_fundraisers(limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0)):
    return get_fundraisers(True, limit, offset)

@app.post("/api/fundraiser/{fundraiser_id}/donate")
def donate_to_fundraiser(
    fundraiser_id: int,
    Amount: int = Form(...),
    Email: str = Form(...),
    PasswordHash: str = Form(...)
):
    donator_id = get_User_by_auth(Email, PasswordHash)
    if not donator_id:
        return Response(content='{"error": "Unauthorized"}', status_code=403, media_type="application/json")

    success = make_donation(donator_id, fundraiser_id, Amount)
    if not success:
        return Response(content='{"error": "Donation failed or fundraiser not found/inactive"}', status_code=400, media_type="application/json")
        
    return {"message": "Donation successful"}

@app.get("/api/user/{user_id}/donations")
def get_user_donations(user_id: int, limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0)):
    return get_donations_by_user(user_id, limit, offset)

app.mount("/", StaticFiles(directory="./frontend", html=True))
