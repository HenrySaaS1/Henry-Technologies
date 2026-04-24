-- Add client onboarding (wizard) payload + completion; existing rows treated as already onboarded.
ALTER TABLE "User" ADD COLUMN "onboardingData" JSONB;
ALTER TABLE "User" ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);

UPDATE "User" SET "onboardingCompletedAt" = "createdAt" WHERE "onboardingCompletedAt" IS NULL;
