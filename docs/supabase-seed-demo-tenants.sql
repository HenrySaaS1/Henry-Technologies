/*
  Henry — upsert Harland + Aviora demo users in Supabase (Postgres).

  WHEN TO USE
  - You already applied schema (Prisma migrations or docs/supabase-apply-henry-schema.sql).
  - You want demo logins without running Node seed from your laptop.

  PASSWORDS (demo only — rotate for production)
  - landerson@harlandmedical.com / Harland@123
  - landerson@aviora.com       / Aviora@123

  BEFORE YOU RUN
  - Bcrypt hashes below were generated with bcryptjs cost 10. Re-run seed from Node if you change passwords.
  - Stable ids avoid duplicate rows if you re-run this script (conflict target is email).

  RUN
  Supabase → SQL Editor → paste → Run once (safe to re-run: upserts by email).
*/

INSERT INTO "User" (
  "id",
  "email",
  "passwordHash",
  "company",
  "slug",
  "planId",
  "productIds",
  "dashboardPreset",
  "onboardingCompletedAt",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'henry_seed_harland_landerson',
    'landerson@harlandmedical.com',
    '$2b$10$j8e5j7KpgH6fVjJi9131jOS707upE6QGzyyu3jELoxgZ7IZ.kVC2e',
    'Harland Medical Systems',
    'harland',
    'premium',
    '["core","factory-analytics","automation","myhenry"]',
    'harland',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'henry_seed_aviora_landerson',
    'landerson@aviora.com',
    '$2b$10$9gRJZnnj.yJZh3MNeyxoB.FBbOK.gqqZKlDdW7Tvuo8zEeiUsgStK',
    'AVIORA CONSTRUCTION INC',
    'aviora',
    'premium',
    '["core","factory-analytics","automation","myhenry"]',
    'aviora',
    NOW(),
    NOW(),
    NOW()
  )
ON CONFLICT ("email") DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  "company" = EXCLUDED."company",
  "slug" = EXCLUDED."slug",
  "planId" = EXCLUDED."planId",
  "productIds" = EXCLUDED."productIds",
  "dashboardPreset" = EXCLUDED."dashboardPreset",
  "onboardingCompletedAt" = EXCLUDED."onboardingCompletedAt",
  "updatedAt" = NOW();
