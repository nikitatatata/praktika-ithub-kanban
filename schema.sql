CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Email" text NOT NULL UNIQUE,
    "Phone" text NOT NULL,
    "FirstName" text NOT NULL,
    "SurName" text NOT NULL,
    "LastName" text,
    "PassHash" text NOT NULL,
    "Description" text,
    "Location" text
);

CREATE TABLE IF NOT EXISTS "public"."Animal" (
    "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Type" text NOT NULL,
    "Breed" text NOT NULL,
    "Name" text NOT NULL,
    "Description" text NOT NULL,
    "OrientatedAge" bigint NOT NULL,
    "Cost" bigint NOT NULL,
    "Sterealized" boolean NOT NULL,
    "ImagePath" text
);

CREATE TABLE IF NOT EXISTS "public"."Fundraisers" (
    "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "CreatorUserID" bigint NOT NULL REFERENCES "public"."User"("id") ON DELETE CASCADE,
    "AnimalID" bigint REFERENCES "public"."Animal"("id") ON DELETE CASCADE,
    "Title" text NOT NULL,
    "TargetAmount" bigint NOT NULL,
    "CurrentAmount" bigint NOT NULL DEFAULT 0,
    "Description" text,
    "ImagePath" text,
    "IsActive" boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "public"."OwnedByUsers" (
    "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "UserID" bigint NOT NULL REFERENCES "public"."User"("id") ON DELETE CASCADE,
    "AnimalID" bigint NOT NULL REFERENCES "public"."Animal"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "public"."Donations" (
    "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "FundraiserID" bigint NOT NULL REFERENCES "public"."Fundraisers"("id") ON DELETE CASCADE,
    "DonatorUserID" bigint NOT NULL REFERENCES "public"."User"("id") ON DELETE CASCADE,
    "Amount" bigint NOT NULL,
    "Timestamp" timestamp with time zone NOT NULL DEFAULT now()
);

INSERT INTO "public"."Animal" ("Type", "Breed", "Name", "Description", "OrientatedAge", "Cost", "Sterealized", "ImagePath")
SELECT v."Type", v."Breed", v."Name", v."Description", v."OrientatedAge", v."Cost", v."Sterealized", v."ImagePath"
FROM (VALUES 
    ('Cat'::text, 'Siamese'::text, 'Barsik'::text, 'Very fluffy and friendly'::text, 2::bigint, 5000::bigint, true::boolean, 'https://images.unsplash.com/photo-1574158622682-e40e69841006?auto=format&fit=crop&w=500&q=60'::text),
    ('Dog'::text, 'Bulldog'::text, 'Rex'::text, 'Strong and loyal'::text, 4::bigint, 10000::bigint, false::boolean, 'https://images.unsplash.com/photo-1597633425046-08ebb7960e93?auto=format&fit=crop&w=500&q=60'::text),
    ('Bird'::text, 'Parrot'::text, 'Kesha'::text, 'Talkative and smart'::text, 1::bigint, 3000::bigint, false::boolean, 'https://images.unsplash.com/photo-1552728089-57bdde3e70aa?auto=format&fit=crop&w=500&q=60'::text),
    ('Cat'::text, 'Sphynx'::text, 'Baldy'::text, 'Loves warm places'::text, 3::bigint, 15000::bigint, true::boolean, 'https://images.unsplash.com/photo-1609423436220-2270a2f3df41?auto=format&fit=crop&w=500&q=60'::text),
    ('Dog'::text, 'Corgi'::text, 'Ein'::text, 'Smart and fast'::text, 2::bigint, 20000::bigint, true::boolean, 'https://images.unsplash.com/photo-1559214914-ca3683055158?auto=format&fit=crop&w=500&q=60'::text),
    ('Cat'::text, 'Maine Coon'::text, 'Test_Cat_1'::text, 'Тестовый кот'::text, 2::bigint, 1000::bigint, true::boolean, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=500&q=60'::text),
    ('Dog'::text, 'Bulldog'::text, 'Test_Bulldog_1'::text, 'Тестовый бульдог'::text, 5::bigint, 1200::bigint, false::boolean, 'https://images.unsplash.com/photo-1518375153482-1def529cc453?auto=format&fit=crop&w=500&q=60'::text),
    ('Cat'::text, 'Sphynx'::text, 'Test_Sphynx_1'::text, 'Тестовый сфинкс 3 года стерилизован'::text, 3::bigint, 2000::bigint, true::boolean, 'https://images.unsplash.com/photo-1609423436220-2270a2f3df41?auto=format&fit=crop&w=500&q=60'::text),
    ('Cat'::text, 'Persian'::text, 'Test_Persian_1'::text, 'Тестовый кот 2 года стерилизован'::text, 2::bigint, 800::bigint, true::boolean, 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=500&q=60'::text)
) AS v("Type", "Breed", "Name", "Description", "OrientatedAge", "Cost", "Sterealized", "ImagePath")
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."Animal" a WHERE a."Name" = v."Name"
);