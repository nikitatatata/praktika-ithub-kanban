import psycopg
from pathlib import Path

class PostgresDB:
    def __init__(self, dsn: str, schema_file: str | None = None):
        self.dsn = dsn
        self.schema_file = schema_file
        self.conn = None
        
        # Выполняется автоматически при создании экземпляра
        self._connect_and_init()

    def _connect_and_init(self):
        # 1. Синхронное подключение
        self.conn = psycopg.connect(self.dsn)
        
        # 2. Инициализация схемы, если файл указан и существует
        if self.schema_file and Path(self.schema_file).exists():
            self._init_schema()

    def _init_schema(self):
        query = Path(self.schema_file).read_text(encoding='utf-8')
        with self.conn.cursor() as cur:
            cur.execute(query)
        self.conn.commit()

    def close(self):
        if self.conn and not self.conn.closed:
            self.conn.close()

    def execute(self, query: str, params: tuple = None, fetch: bool = False):
        with self.conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
            try:
                cur.execute(query, params)
                self.conn.commit()
                if fetch:
                    return cur.fetchall()
                return None # Возвращаем None при успешной операции записи (INSERT, UPDATE)
            except Exception as e:
                self.conn.rollback() # Откатываем транзакцию в случае ошибки
                return e