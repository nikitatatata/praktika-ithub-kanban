CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Email" text NOT NULL UNIQUE,
    "FirstName" text NOT NULL,
    "SurName" text NOT NULL,
    "LastName" text NOT NULL,
    "PassHash" text NOT NULL,
    "Type" text NOT NULL,
    "Description" text NOT NULL,
    "Location" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."Animal" (
    "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Type" text NOT NULL,
    "Breed" text NOT NULL,
    "Name" text NOT NULL,
    "Description" text NOT NULL,
    "OrientatedAge" bigint NOT NULL,
    "Cost" bigint NOT NULL,
    "Sterealized" boolean NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."Commissions" (
    "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Summ" bigint NOT NULL,
    "UserID" bigint NOT NULL,
    "Current" bigint NOT NULL,
    "Description" text -- Исправлено на text (в исходнике было bigint)
);

CREATE TABLE IF NOT EXISTS "public"."OwnedByUsers" (
    "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "AnimalID" bigint NOT NULL
);