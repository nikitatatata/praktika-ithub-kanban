#!/bin/bash

BASE_URL="http://127.0.0.1:8080"

echo "=== 1. Получить всех животных (без фильтров) ==="
curl -sS -X 'GET' "${BASE_URL}/api/animal" -H 'accept: application/json'
echo -e "\n"

echo "=== 2. Найти только котов (фильтр по типу Type) ==="
curl -sS -X 'GET' "${BASE_URL}/api/animal?Type=Cat" -H 'accept: application/json'
echo -e "\n"

echo "=== 3. Найти собак конкретной породы (фильтры Type и Breed) ==="
curl -sS -X 'GET' "${BASE_URL}/api/animal?Type=Dog&Breed=Bulldog" -H 'accept: application/json'
echo -e "\n"

echo "=== 4. Найти стерилизованных животных определенного возраста (фильтры Age и Sterealized) ==="
curl -sS -X 'GET' "${BASE_URL}/api/animal?Age=2&Sterealized=true" -H 'accept: application/json'
echo -e "\n"

echo "=== 5. Поиск сразу по всем возможным параметрам ==="
curl -sS -X 'GET' "${BASE_URL}/api/animal?Type=Cat&Breed=Sphynx&Age=3&Sterealized=true" -H 'accept: application/json'
echo -e "\n"

echo "=== 5.5. Регистрация тестового пользователя для загрузки ==="
curl -sS -X POST "${BASE_URL}/api/register" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Email=testuser@mail.com&PasswordHash=secret123&Firstname=Test&Surname=User"
echo -e "\n"

echo "=== 6. Создание нового животного с загрузкой файла ==="
# Создаем временный тестовый файл, если его нет
if [ ! -f "test_image.jpg" ]; then
    echo "Creating dummy test_image.jpg"
    touch test_image.jpg
fi

curl -sS -X POST "${BASE_URL}/api/animal" \
  -H "accept: application/json" \
  -F "Type=Dog" \
  -F "Breed=Test Retriever" \
  -F "Name=Goldie_the_Test_Dog" \
  -F "Description=A very good dog for testing uploads" \
  -F "OrientatedAge=1" \
  -F "Cost=1337" \
  -F "Sterealized=false" \
  -F "image=@test_image.jpg" \
  -F "Email=testuser@mail.com" \
  -F "PasswordHash=secret123"
echo -e "\n"

echo "=== 7. Получить всех животных тестового пользователя (предположим ID=1) ==="
curl -sS -X 'GET' "${BASE_URL}/api/user/1/animals" -H 'accept: application/json'
echo -e "\n"

echo "=== 8. Тестирование пагинации (получить первых 2 животных) ==="
curl -sS -X 'GET' "${BASE_URL}/api/animal?limit=2" -H 'accept: application/json'
echo -e "\n"

echo "=== 9. Тестирование пагинации со смещением (получить следующих 2 животных) ==="
curl -sS -X 'GET' "${BASE_URL}/api/animal?limit=2&offset=2" -H 'accept: application/json'
echo -e "\n"

echo "=== 10. Получение одного животного по ID (успех) ==="
curl -sS -X 'GET' "${BASE_URL}/api/animal/1" -H 'accept: application/json'
echo -e "\n"

echo "=== 11. Получение одного животного по ID (ошибка 404) ==="
curl -sS -X 'GET' "${BASE_URL}/api/animal/9999" -H 'accept: application/json'
echo -e "\n"

echo "=== 12. Регистрация второго пользователя (для донатов) ==="
curl -sS -X POST "${BASE_URL}/api/register" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Email=donator@mail.com&PasswordHash=secret456&Firstname=Don&Surname=Ator"
echo -e "\n"

echo "=== 13. Создание сбора средств (для животного с ID=1) ==="
curl -sS -X POST "${BASE_URL}/api/fundraiser" \
  -H "accept: application/json" \
  -F "TargetAmount=10000" \
  -F "Description=На операцию для Кеши" \
  -F "AnimalID=1" \
  -F "Email=testuser@mail.com" \
  -F "PasswordHash=secret123"
echo -e "\n"

echo "=== 14. Получение списка активных сборов ==="
curl -sS -X 'GET' "${BASE_URL}/api/fundraisers" -H 'accept: application/json'
echo -e "\n"

echo "=== 15. Совершение пожертвования (на сбор с ID=1) ==="
curl -sS -X POST "${BASE_URL}/api/fundraiser/1/donate" \
  -H "accept: application/json" \
  -F "Amount=500" \
  -F "Email=donator@mail.com" \
  -F "PasswordHash=secret456"
echo -e "\n"

echo "=== 16. Проверка обновленной суммы в сборе ==="
curl -sS -X 'GET' "${BASE_URL}/api/fundraisers" -H 'accept: application/json'
echo -e "\n"

echo "=== 17. Получение истории пожертвований пользователя (donator, ID=2) ==="
curl -sS -X 'GET' "${BASE_URL}/api/user/2/donations" -H 'accept: application/json'
echo -e "\n"

echo "=== 18. Поиск по параметрам с пагинацией (Cat, limit=1) ==="
curl -sS -X 'GET' "${BASE_URL}/api/animal?Type=Cat&limit=1" -H 'accept: application/json'
echo -e "\n"

echo "=== 19. Получение профиля пользователя (testuser, ID=1) ==="
curl -sS -X 'GET' "${BASE_URL}/api/user/1" -H 'accept: application/json'
echo -e "\n"

echo "=== 20. Удаление животного владельцем (animal ID=10) ==="
curl -sS -i -X 'DELETE' "${BASE_URL}/api/animal/10" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Email=testuser@mail.com&PasswordHash=secret123"
echo -e "\n"