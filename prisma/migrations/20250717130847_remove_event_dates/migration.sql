/*
  Warnings:

  - You are about to drop the column `endDate` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Event` table. All the data in the column will be lost.
  - Added the required column `applyEnd` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `applyStart` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "applyEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "applyStart" TIMESTAMP(3) NOT NULL;
