/*
  Warnings:

  - The values [AI_ANALYZING,PENDING_MODERATION] on the enum `ReportStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [MODERATOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `analysisStatus` on the `IncidentIntelligence` table. All the data in the column will be lost.
  - You are about to drop the column `currentModeratorId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the `ModeratorAction` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AIProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterEnum
ALTER TYPE "AuthorityActionType" ADD VALUE 'REJECTED';

-- AlterEnum
BEGIN;
CREATE TYPE "ReportStatus_new" AS ENUM ('SUBMITTED', 'PENDING_AUTHORITY', 'VERIFIED', 'REJECTED', 'RESOLVED', 'CLOSED');
ALTER TABLE "public"."Report" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Report" ALTER COLUMN "status" TYPE "ReportStatus_new" USING ("status"::text::"ReportStatus_new");
ALTER TYPE "ReportStatus" RENAME TO "ReportStatus_old";
ALTER TYPE "ReportStatus_new" RENAME TO "ReportStatus";
DROP TYPE "public"."ReportStatus_old";
ALTER TABLE "Report" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('CITIZEN', 'AUTHORITY', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CITIZEN';
COMMIT;

-- DropForeignKey
ALTER TABLE "AuthorityAction" DROP CONSTRAINT "AuthorityAction_reportId_fkey";

-- DropForeignKey
ALTER TABLE "IncidentIntelligence" DROP CONSTRAINT "IncidentIntelligence_reportId_fkey";

-- DropForeignKey
ALTER TABLE "ModeratorAction" DROP CONSTRAINT "ModeratorAction_moderatorId_fkey";

-- DropForeignKey
ALTER TABLE "ModeratorAction" DROP CONSTRAINT "ModeratorAction_reportId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_currentModeratorId_fkey";

-- DropForeignKey
ALTER TABLE "ReportImage" DROP CONSTRAINT "ReportImage_reportId_fkey";

-- DropIndex
DROP INDEX "Report_currentModeratorId_idx";

-- AlterTable
ALTER TABLE "IncidentIntelligence" DROP COLUMN "analysisStatus",
ADD COLUMN     "processingStatus" "AIProcessingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "reasoning" TEXT;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "currentModeratorId";

-- DropTable
DROP TABLE "ModeratorAction";

-- DropEnum
DROP TYPE "AnalysisStatus";

-- DropEnum
DROP TYPE "ModeratorActionType";

-- CreateIndex
CREATE INDEX "AuthorityAction_reportId_idx" ON "AuthorityAction"("reportId");

-- CreateIndex
CREATE INDEX "AuthorityAction_authorityId_idx" ON "AuthorityAction"("authorityId");

-- CreateIndex
CREATE INDEX "IncidentIntelligence_processingStatus_idx" ON "IncidentIntelligence"("processingStatus");

-- CreateIndex
CREATE INDEX "IncidentIntelligence_priorityScore_idx" ON "IncidentIntelligence"("priorityScore");

-- CreateIndex
CREATE INDEX "ReportImage_reportId_idx" ON "ReportImage"("reportId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "ReportImage" ADD CONSTRAINT "ReportImage_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentIntelligence" ADD CONSTRAINT "IncidentIntelligence_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorityAction" ADD CONSTRAINT "AuthorityAction_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
