-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ScanStatus" ADD VALUE 'QUEUED';
ALTER TYPE "ScanStatus" ADD VALUE 'PROCESSING';

-- DropForeignKey
ALTER TABLE "scans" DROP CONSTRAINT "scans_userId_fkey";

-- AlterTable
ALTER TABLE "scans" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "engineResults" JSONB,
ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'website',
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "targetUrl" TEXT,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "startedAt" DROP NOT NULL,
ALTER COLUMN "startedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
