from db import PostgresDB

db = PostgresDB(
    dsn="postgresql://nik:qwe@localhost:5432/",
    schema_file="schema.sql"
)

def validate_User(Email: str, PasswordHash: str) -> bool:
    res = db.execute("""
        SELECT 1 FROM "public"."User" 
        WHERE "Email" = %s AND "PassHash" = %s
    """, (Email, PasswordHash), fetch=True)
    return len(res) > 0

def add_User(
        Email: str, 
        PasswordHash: str, 
        Firstname: str, 
        Surname: str, 
        Type: str,
        Lastname: str = "",
        Description: str = "",
        Location: str = ""
):
    db.execute("""
        INSERT INTO "public"."User" 
        ("Email", "FirstName", "LastName", "Location", "PassHash", "SurName", "Type", "Description") 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (Email, Firstname, Lastname, Location, PasswordHash, Surname, Type, Description))

def add_Animal(
        Type: str,
        Breed: str,
        Name: str,
        Description: str,
        OrientatedAge: int,
        Cost: int,
        Sterealized: bool
):
    db.execute("""
        INSERT INTO "public"."Animal" 
        ("Type", "Breed", "Name", "Description", "OrientatedAge", "Cost", "Sterealized") 
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (Type, Breed, Name, Description, OrientatedAge, Cost, Sterealized))

def get_Animals(
        Type: str = None,
        Breed: str = None,
        Age: int = None,
        Sterealized: bool = None
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

    return db.execute(query, tuple(params), fetch=True)

