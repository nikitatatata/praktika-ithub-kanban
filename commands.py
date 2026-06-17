from db import PostgresDB
import psycopg

db = PostgresDB(
    dsn="postgresql://root:123@127.0.0.1:5432/",
    schema_file="schema.sql"
)

def validate_User(Email: str, PasswordHash: str) -> bool:
    res = db.execute("""
        SELECT 1 FROM "public"."User" 
        WHERE "Email" = %s AND "PassHash" = %s
    """, (Email, PasswordHash), fetch=True)
    return isinstance(res, list) and len(res) > 0

def get_User_by_auth(Email: str, PasswordHash: str):
    res = db.execute("""
        SELECT "id" FROM "public"."User" 
        WHERE "Email" = %s AND "PassHash" = %s
    """, (Email, PasswordHash), fetch=True)
    if isinstance(res, list) and len(res) > 0:
        return res[0]['id']
    return None

def get_User_by_id(user_id: int):
    res = db.execute("""
        SELECT "id", "Email", "Phone", "FirstName", "SurName", "LastName", "Description", "Location"
        FROM "public"."User" 
        WHERE "id" = %s
    """, (user_id,), fetch=True)
    if isinstance(res, list) and len(res) > 0:
        return res[0]
    return None

def add_User(
        Email: str, 
        PasswordHash: str, 
        Firstname: str, 
        Surname: str,
        Phone: str,
        Lastname: str = "",
        Description: str = "",
        Location: str = ""
):
    res = db.execute("""
            INSERT INTO "public"."User" 
            ("Email", "Phone", "FirstName", "LastName", "Location", "PassHash", "SurName", "Description")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (Email, Phone, Firstname, Lastname, Location, PasswordHash, Surname, Description), fetch=True)
    if isinstance(res, Exception) or not res:
        return None
    return res[0]['id']

def update_User(
        user_id: int,
        Firstname: str,
        Surname: str,
        Phone: str,
        Lastname: str = "",
        Description: str = "",
        Location: str = ""
):
    res = db.execute("""
        UPDATE "public"."User"
        SET "FirstName" = %s, "SurName" = %s, "Phone" = %s, "LastName" = %s, "Description" = %s, "Location" = %s
        WHERE "id" = %s
    """, (Firstname, Surname, Phone, Lastname, Description, Location, user_id))
    if isinstance(res, Exception):
        return False
    return True

def add_Animal(
        Type: str,
        Breed: str,
        Name: str,
        Description: str,
        OrientatedAge: int,
        Cost: int,
        Sterealized: bool,
        ImagePath: str,
        OwnerID: int = None
):
    # Проверяем, существует ли уже животное с таким именем
    existing_animal = db.execute('SELECT id FROM "public"."Animal" WHERE "Name" = %s', (Name,), fetch=True)
    if isinstance(existing_animal, Exception) or existing_animal:
        # Если существует, возвращаем None, чтобы сигнализировать о конфликте
        return None

    res = db.execute("""
        INSERT INTO "public"."Animal" 
        ("Type", "Breed", "Name", "Description", "OrientatedAge", "Cost", "Sterealized", "ImagePath") 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (Type, Breed, Name, Description, OrientatedAge, Cost, Sterealized, ImagePath), fetch=True)
    
    if isinstance(res, Exception):
        return None

    if OwnerID and isinstance(res, list) and len(res) > 0:
        animal_id = res[0]['id']
        db.execute("""
            INSERT INTO "public"."OwnedByUsers" ("UserID", "AnimalID")
            VALUES (%s, %s)
        """, (OwnerID, animal_id))
    
    return res

def get_Animals(
        Type: str = None,
        Breed: str = None,
        Age: int = None,
        Sterealized: bool = None,
        limit: int = 20,
        offset: int = 0
):
    query = 'SELECT * FROM "public"."Animal" WHERE 1=1'
    params = []

    if Type is not None:
        query += ' AND "Type" = %s'
        params.append(Type)
    if Breed is not None:
        query += ' AND "Breed" = %s'
        params.append(Breed)
    if Age is not None:
        query += ' AND "OrientatedAge" = %s'
        params.append(Age)
    if Sterealized is not None:
        query += ' AND "Sterealized" = %s'
        params.append(Sterealized)

    # Добавляем сортировку для консистентной пагинации и лимиты
    query += ' ORDER BY id DESC'
    query += ' LIMIT %s OFFSET %s'
    params.append(limit)
    params.append(offset)

    return db.execute(query, tuple(params), fetch=True)

def get_Animals_by_User(UserID: int, limit: int = 20, offset: int = 0):
    query = """
        SELECT a.* FROM "public"."Animal" a
        JOIN "public"."OwnedByUsers" o ON a.id = o."AnimalID"
        WHERE o."UserID" = %s
        ORDER BY a.id DESC
        LIMIT %s OFFSET %s
    """
    return db.execute(query, (UserID, limit, offset), fetch=True)

def get_Animal_by_id(animal_id: int):
    res = db.execute("""
        SELECT * FROM "public"."Animal" WHERE id = %s
    """, (animal_id,), fetch=True)
    if isinstance(res, list) and len(res) > 0:
        return res[0]
    return None

def delete_Animal(animal_id: int, user_id: int):
    # Проверяем существование животного
    animal = db.execute('SELECT 1 FROM "public"."Animal" WHERE "id" = %s', (animal_id,), fetch=True)
    if isinstance(animal, Exception) or not animal:
        return 404
        
    # Проверяем, принадлежит ли оно пользователю
    owner = db.execute('SELECT 1 FROM "public"."OwnedByUsers" WHERE "AnimalID" = %s AND "UserID" = %s', (animal_id, user_id), fetch=True)
    if isinstance(owner, Exception) or not owner:
        return 403
        
    # Удаляем (каскадное удаление в БД само уберет связи из OwnedByUsers и Fundraisers)
    res = db.execute('DELETE FROM "public"."Animal" WHERE "id" = %s', (animal_id,))
    if isinstance(res, Exception):
        return 500
    return 204

def create_fundraiser(CreatorUserID: int, Title: str, TargetAmount: int, Description: str, ImagePath: str, AnimalID: int = None):
    query = """
        INSERT INTO "public"."Fundraisers" ("CreatorUserID", "AnimalID", "Title", "TargetAmount", "Description", "ImagePath")
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING *
    """
    params = (CreatorUserID, AnimalID, Title, TargetAmount, Description, ImagePath)
    res = db.execute(query, params, fetch=True)
    if isinstance(res, Exception) or not res:
        return None
    return res[0]

def get_fundraiser_by_id(fundraiser_id: int):
    res = db.execute('SELECT * FROM "public"."Fundraisers" WHERE id = %s', (fundraiser_id,), fetch=True)
    if res and isinstance(res, list):
        return res[0]
    return None

def make_donation(DonatorUserID: int, FundraiserID: int, Amount: int):
    # Используем транзакцию для атомарного обновления и вставки
    with db.conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
        try:
            # 1. Обновляем сумму в сборе и проверяем, что он активен
            cur.execute("""
                UPDATE "public"."Fundraisers"
                SET "CurrentAmount" = "CurrentAmount" + %s
                WHERE id = %s AND "IsActive" = true
                RETURNING "CurrentAmount", "TargetAmount"
            """, (Amount, FundraiserID))
            
            updated_fundraiser = cur.fetchone()
            if not updated_fundraiser:
                db.conn.rollback()
                return False

            # 2. Записываем пожертвование в историю
            cur.execute("""
                INSERT INTO "public"."Donations" ("FundraiserID", "DonatorUserID", "Amount")
                VALUES (%s, %s, %s)
            """, (FundraiserID, DonatorUserID, Amount))

            # 3. Если цель достигнута, закрываем сбор
            if updated_fundraiser['CurrentAmount'] >= updated_fundraiser['TargetAmount']:
                cur.execute('UPDATE "public"."Fundraisers" SET "IsActive" = false WHERE id = %s', (FundraiserID,))

            db.conn.commit()
            return True
        except Exception as e:
            db.conn.rollback()
            print(f"Donation transaction failed: {e}")
            return False

def get_fundraisers(is_active: bool = True, limit: int = 20, offset: int = 0):
    query = 'SELECT * FROM "public"."Fundraisers" WHERE "IsActive" = %s ORDER BY id DESC LIMIT %s OFFSET %s'
    return db.execute(query, (is_active, limit, offset), fetch=True)

def get_donations_by_user(user_id: int, limit: int = 20, offset: int = 0):
    query = """
        SELECT d.id, d."Amount", d."Timestamp", f."Description" as "FundraiserDescription"
        FROM "public"."Donations" d
        JOIN "public"."Fundraisers" f ON d."FundraiserID" = f.id
        WHERE d."DonatorUserID" = %s
        ORDER BY d."Timestamp" DESC
        LIMIT %s OFFSET %s
    """
    return db.execute(query, (user_id, limit, offset), fetch=True)
