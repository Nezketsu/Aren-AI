-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "maxParticipants" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tokenBalance" INTEGER NOT NULL DEFAULT 0;
