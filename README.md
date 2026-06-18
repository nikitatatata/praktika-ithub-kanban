# Лапы крылья и хвосты
## Описание проекта
## Развёртка
### Установка окружения
``` python
python -m virtualenv .venv
# Активируйте venv
pip install fastapi[standard] psycopg-binary psycopg2-binary psycopg
```

### Зависимости
postgresql ссылка на который задана в commands.py на пятой строке.
Запустить можно `podman run --rm -it --name pg -p 127.0.0.1:5432:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=123 docker.io/postgres`

### Запуск сервера
``` bash
fastapi dev --host 127.0.0.1 --port 8080
```

