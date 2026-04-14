import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

/** Same default module ids as frontend `productCatalog.js` */
const DEFAULT_PRODUCT_IDS = ['core', 'factory-analytics', 'automation', 'myhenry']

const prisma = new PrismaClient()

async function main() {
  const email = 'ops@harlandmedical.com'
  const password = 'Harland@123'
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      company: 'Harland Medical Systems',
      slug: 'harland',
      planId: 'premium',
      productIds: JSON.stringify([...DEFAULT_PRODUCT_IDS]),
    },
    update: {
      passwordHash,
      company: 'Harland Medical Systems',
      slug: 'harland',
      planId: 'premium',
      productIds: JSON.stringify([...DEFAULT_PRODUCT_IDS]),
    },
  })
  console.log('Harland client user ready:', user.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
