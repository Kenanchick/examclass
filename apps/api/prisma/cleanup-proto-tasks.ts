import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  // Удаляем старые PROTO задачи
  const deleted = await prisma.task.deleteMany({
    where: {
      publicId: { in: ['PROTO01', 'PROTO02', 'PROTO03'] },
    },
  });

  console.log(`✓ Удалено ${deleted.count} старых PROTO-задач`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
