#!/bin/bash

BASE_URL="http://127.0.0.1:8080"

# Вспомогательная функция для вывода заголовков
print_header() {
    echo -e "\n================================================="
    echo "  $1"
    echo "================================================="
}

# --- Тесты регистрации ---

print_header "1. Регистрация: Неполный запрос (нет PasswordHash)"
echo "Ожидаем: 422 Unprocessable Entity"
curl -i -X POST "${BASE_URL}/api/register" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Email=fail_user1@mail.com&Firstname=Fail&Surname=User"

print_header "2. Регистрация: Попытка дублирования пользователя"
echo "Сначала регистрируем пользователя..."
curl -sS -X POST "${BASE_URL}/api/register" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Email=duplicate@mail.com&PasswordHash=secret123&Firstname=Dupli&Surname=Cate&Phone=1234567890" > /dev/null
echo "Ожидаем: 409 Conflict при повторной регистрации"
curl -i -X POST "${BASE_URL}/api/register" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Email=duplicate@mail.com&PasswordHash=secret123&Firstname=Dupli&Surname=Cate&Phone=1234567890"

# --- Тесты входа ---

print_header "3. Логин: Неверный пароль"
echo "Ожидаем: 403 Forbidden"
curl -i -X POST "${BASE_URL}/api/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Email=testuser@mail.com&PasswordHash=wrongpassword"

print_header "4. Логин: Несуществующий пользователь"
echo "Ожидаем: 403 Forbidden"
curl -i -X POST "${BASE_URL}/api/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Email=nosuchuser@mail.com&PasswordHash=anypassword"

# --- Тесты поиска животных (GET) ---

print_header "5. Поиск животных: Неверный параметр (limit > 100)"
echo "Ожидаем: 422 Unprocessable Entity"
curl -i -X 'GET' "${BASE_URL}/api/animal?limit=101" -H 'accept: application/json'

# --- Тесты создания животного (POST) ---

print_header "6. Создание животного: Без аутентификации"
echo "Ожидаем: 422 Unprocessable Entity (т.к. поля Email и PasswordHash обязательны)"
curl -i -X POST "${BASE_URL}/api/animal" \
  -H "accept: application/json" \
  -F "Type=Dog" \
  -F "Name=Ghost" \
  -F "Breed=Direwolf" \
  -F "Description=Needs no auth" \
  -F "OrientatedAge=5" \
  -F "Cost=0" \
  -F "Sterealized=false" \
  -F "image=@test_image.jpg"

print_header "7. Создание животного: Неверная аутентификация"
echo "Ожидаем: 403 Forbidden"
curl -i -X POST "${BASE_URL}/api/animal" \
  -H "accept: application/json" \
  -F "Type=Dog" \
  -F "Name=Shadow" \
  -F "Breed=GoodBoi" \
  -F "Description=Invalid auth" \
  -F "OrientatedAge=2" \
  -F "Cost=100" \
  -F "Sterealized=true" \
  -F "image=@test_image.jpg" \
  -F "Email=testuser@mail.com" \
  -F "PasswordHash=wrongpassword"

print_header "8. Получение животного: Неверный ID (не число)"
echo "Ожидаем: 422 Unprocessable Entity"
curl -i -X 'GET' "${BASE_URL}/api/animal/abc" -H 'accept: application/json'

print_header "9. Получение животного: Несуществующий ID"
echo "Ожидаем: 404 Not Found"
curl -i -X 'GET' "${BASE_URL}/api/animal/99999" -H 'accept: application/json'

print_header "10. Пожертвование: Несуществующий сбор"
echo "Ожидаем: 400 Bad Request"
curl -i -X POST "${BASE_URL}/api/fundraiser/99999/donate" \
  -H "accept: application/json" \
  -F "Amount=500" \
  -F "Email=testuser@mail.com" \
  -F "PasswordHash=secret123"

print_header "11. Создание животного: Существующее имя (Barsik)"
echo "Ожидаем: 409 Conflict"
if [ ! -f "test_image.jpg" ]; then
    touch test_image.jpg
fi
curl -i -X POST "${BASE_URL}/api/animal" \
  -H "accept: application/json" \
  -F "Type=Cat" \
  -F "Name=Barsik" \
  -F "Breed=Siamese" \
  -F "Description=Duplicate" \
  -F "OrientatedAge=2" \
  -F "Cost=0" \
  -F "Sterealized=true" \
  -F "image=@test_image.jpg" \
  -F "Email=testuser@mail.com" \
  -F "PasswordHash=secret123"

print_header "12. Получение профиля: Несуществующий пользователь"
echo "Ожидаем: 404 Not Found"
curl -i -X 'GET' "${BASE_URL}/api/user/99999" -H 'accept: application/json'

print_header "13. Удаление животного: Чужое животное (ID=1)"
echo "Ожидаем: 403 Forbidden"
curl -i -X 'DELETE' "${BASE_URL}/api/animal/1" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Email=testuser@mail.com&PasswordHash=secret123"

print_header "14. Удаление животного: Несуществующее животное"
echo "Ожидаем: 404 Not Found"
curl -i -X 'DELETE' "${BASE_URL}/api/animal/99999" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Email=testuser@mail.com&PasswordHash=secret123"