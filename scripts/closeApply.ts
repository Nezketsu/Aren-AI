// scripts/closeApply.ts
// Usage: npx tsx scripts/closeApply.ts <eventId>

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const eventId = process.argv[2];
  if (!eventId) {
    console.error('Usage: npx tsx scripts/closeApply.ts <eventId>');
    process.exit(1);
  }

  // Set applyEnd to now - 1 minute
  const now = new Date(Date.now() - 60 * 1000);
  const event = await prisma.event.update({
    where: { id: eventId },
    data: { applyEnd: now },
  });
  console.log(`Registration closed for event '${event.name}' (ID: ${event.id}). New applyEnd: ${now.toISOString()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
