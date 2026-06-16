from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles
from commands import *

# add_User("teto@teto.teto", "3t62gd7d2387", "nik", "tar", "admin", "serg", "Касане тето", "Москва")
print(validate_User("teto@teto.teto", "3t62gd7d2387"))
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

@app.post("/api/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

@app.post("/api/register")
def register(
    Email: str, 
    PasswordHash: str, 
    Firstname: str, 
    Surname: str,
    Lastname: str = "",
    Description: str = "",
    Location: str = ""
):
    res = add_User(Email, PasswordHash, Firstname, Surname, Lastname, Description, Location)

    return res

@app.post("/api/login")
def login(
    Email: str, 
    PasswordHash: str 
):
    res = validate_User(Email, PasswordHash)

    return res

app.mount("/", StaticFiles(directory="./frontend", html=True))
