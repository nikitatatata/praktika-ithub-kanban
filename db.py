import psycopg
from psycopg.rows import dict_row

class PostgresDB:
    def __init__(self, dsn: str):
        self.dsn = dsn
        self.conn = None

    def connect(self):
        self.conn = psycopg.connect(self.dsn)

    def close(self):
        if self.conn and not self.conn.closed:
            self.conn.close()

    def execute(self, query: str, params: tuple = None, fetch: bool = False):
        try:
            # dict_row возвращает результаты в виде словарей, а не кортежей
            with self.conn.cursor(row_factory=dict_row) as cur:
                cur.execute(query, params)
                if fetch:
                    return cur.fetchall()
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise RuntimeError(f"Ошибка БД: {e}")

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()