import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

/** Same default module ids as frontend `productCatalog.js` */
const DEFAULT_PRODUCT_IDS = ['core', 'factory-analytics', 'automation', 'myhenry']

const prisma = new PrismaClient()

async function upsertUser({
  email,
  password,
  company,
  slug,
  planId = 'premium',
  dashboardPreset = null,
}) {
  const passwordHash = await bcrypt.hash(password, 10)
  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      company,
      slug,
      dashboardPreset,
      planId,
      productIds: JSON.stringify([...DEFAULT_PRODUCT_IDS]),
      onboardingCompletedAt: new Date(),
    },
    update: {
      passwordHash,
      company,
      slug,
      dashboardPreset,
      planId,
      productIds: JSON.stringify([...DEFAULT_PRODUCT_IDS]),
      onboardingCompletedAt: new Date(),
    },
  })
}

async function main() {
  await upsertUser({
    email: 'landerson@harlandmedical.com',
    password: 'Harland@123',
    company: 'Harland Medical Systems',
    slug: 'harland',
    planId: 'premium',
    dashboardPreset: 'harland',
  })
  console.log('Harland client user ready:', 'landerson@harlandmedical.com')

  const henryDemo = await upsertUser({
    email: 'henry1@gmail.com',
    password: 'Henry@123',
    company: 'Henry Workspace',
    slug: 'henry1',
    planId: 'plus',
    dashboardPreset: 'henry1',
  })
  console.log('Henry single-site demo ready:', henryDemo.email)

  const henry3Demo = await upsertUser({
    email: 'henry3@gmail.com',
    password: 'Henry@123',
    company: 'Henry Workspace — 3 sites',
    slug: 'henry3',
    planId: 'plus',
    dashboardPreset: 'henry3',
  })
  console.log('Henry three-site demo ready:', henry3Demo.email)

  const henry10Demo = await upsertUser({
    email: 'henry10@gmail.com',
    password: 'Henry@123',
    company: 'Henry Workspace — 10 sites',
    slug: 'henry10',
    planId: 'plus',
    dashboardPreset: 'henry10',
  })
  console.log('Henry ten-site demo ready:', henry10Demo.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
