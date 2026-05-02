/*
  Henry (Prisma) schema for Supabase — run in Supabase → SQL Editor for project dsmqoewmvbmquoysrgtz
  WHEN: Sign-in shows "database is migrated" but `prisma migrate deploy` hasn’t succeeded from CI/host.

  1. Paste ALL of this script → Run once.
  2. From your PC (with DIRECT Postgres URI in DATABASE_URL):
       cd backend
       npx prisma migrate resolve --applied 20260411180000_init_postgres
       npx prisma migrate resolve --applied 20260413170000_add_auth_events
       npx prisma migrate resolve --applied 20260424120000_add_user_onboarding

     That registers migrations in `_prisma_migrations` WITHOUT re-running DDL (tables already exist).

  3. Restart Azure API → try sign-in again.

  To register users you still need hashed passwords via your app register flow or seed.
*/

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT 'generic',
    "planId" TEXT,
    "productIds" TEXT NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Contact" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT,
    "interest" TEXT,
    "notes" TEXT,
    "userId" TEXT,
    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AuthEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventType" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "message" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    CONSTRAINT "AuthEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuthEvent_createdAt_idx" ON "AuthEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "AuthEvent_email_createdAt_idx" ON "AuthEvent"("email", "createdAt");

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingData" JSONB;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" TIMESTAMP(3);
UPDATE "User" SET "onboardingCompletedAt" = "createdAt" WHERE "onboardingCompletedAt" IS NULL;

DO $$
BEGIN
  ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "AuthEvent" ADD CONSTRAINT "AuthEvent_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
