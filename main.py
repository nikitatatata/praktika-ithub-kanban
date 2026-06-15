from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import psycopg2
from db import PostgresDB

app = FastAPI()

@app.get("/api/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}

app.mount("/", StaticFiles(directory="./frontend", html=True))