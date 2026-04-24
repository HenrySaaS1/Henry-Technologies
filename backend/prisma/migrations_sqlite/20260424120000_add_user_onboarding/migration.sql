-- SQLite stores Json as TEXT in Prisma
ALTER TABLE "User" ADD COLUMN "onboardingData" TEXT;
ALTER TABLE "User" ADD COLUMN "onboardingCompletedAt" DATETIME;

UPDATE "User" SET "onboardingCompletedAt" = "createdAt" WHERE "onboardingCompletedAt" IS NULL;
