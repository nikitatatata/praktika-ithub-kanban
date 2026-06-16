from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from db import PostgresDB
from contextlib import asynccontextmanager

# 1. Создаем экземпляр, сразу указывая файл со схемой
db = PostgresDB(
    dsn="postgresql://nik:qwe@localhost:5432/",
    schema_file="schema.sql"
)

app = FastAPI()

@app.get("/api/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}

app.mount("/", StaticFiles(directory="./frontend", html=True))