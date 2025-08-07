import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanupOldSessions() {
  // Delete sessions older than 30 days
  const result = await prisma.session.deleteMany({
    where: {
      expires: {
        lt: new Date()
      }
    }
  });
  console.log(`Deleted ${result.count} old sessions.`);
  await prisma.$disconnect();
}

cleanupOldSessions().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
