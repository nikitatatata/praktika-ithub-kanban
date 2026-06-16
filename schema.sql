CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" bigint NOT NULL,
    "Email" text NOT NULL,
    "FirstName" text NOT NULL,
    "SurName" text NOT NULL,
    "LastName" text NOT NULL,
    "PassHash" text NOT NULL,
    "Type" text NOT NULL,
    "Description" text NOT NULL,
    "Location" text NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."OwnedByUsers" (
    "id" bigint NOT NULL,
    "animalID" bigint NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."Animal" (
    "id" bigint NOT NULL,
    "Type" text NOT NULL,
    "Breed" text NOT NULL,
    "Name" text NOT NULL,
    "Description" text NOT NULL,
    "OrientatedAge" bigint NOT NULL,
    "Cost" bigint NOT NULL,
    PRIMARY KEY ("id")
);
