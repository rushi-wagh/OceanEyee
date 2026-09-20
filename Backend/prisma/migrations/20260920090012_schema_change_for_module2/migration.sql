/*
  Warnings:

  - You are about to drop the column `duplicateReports` on the `IncidentIntelligence` table. All the data in the column will be lost.
  - You are about to drop the column `historicalContext` on the `IncidentIntelligence` table. All the data in the column will be lost.
  - You are about to drop the column `socialEvidence` on the `IncidentIntelligence` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "IncidentIntelligence" DROP COLUMN "duplicateReports",
DROP COLUMN "historicalContext",
DROP COLUMN "socialEvidence",
ADD COLUMN     "duplicateAnalysis" JSONB,
ADD COLUMN     "geoAnalysis" JSONB,
ADD COLUMN     "nlpAnalysis" JSONB,
ADD COLUMN     "visionAnalysis" JSONB;
