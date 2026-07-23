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
  const topics = await prisma.topic.findMany({
    where: { slug: { startsWith: 'ege-' } },
    select: { id: true, slug: true },
  });

  const topicIdsToPurge = topics
    .filter((topic) => {
      const match = topic.slug.match(/^ege-(\d{2})-/);
      return match !== null && Number(match[1]) <= 13;
    })
    .map((topic) => topic.id);

  const deleted = await prisma.task.deleteMany({
    where: { topicId: { in: topicIdsToPurge } },
  });

  console.log(`✓ Удалено ${deleted.count} задач (задания 1–13)`);

  const remaining = await prisma.task.findMany({
    select: {
      publicId: true,
      topic: { select: { slug: true } },
    },
    orderBy: { publicId: 'asc' },
  });

  console.log(`\nОсталось ${remaining.length} задач (задания 14–19):`);
  for (const task of remaining) {
    console.log(`  ${task.publicId} — ${task.topic.slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
