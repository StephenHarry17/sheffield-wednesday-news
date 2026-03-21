-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('news', 'match_preview', 'match_report', 'opinion', 'feature', 'transfer');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "articleType" "ArticleType" NOT NULL DEFAULT 'news',
ADD COLUMN     "competition" TEXT,
ADD COLUMN     "isHero" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "matchDate" TEXT,
ADD COLUMN     "matchId" TEXT,
ADD COLUMN     "opponent" TEXT;

-- CreateIndex
CREATE INDEX "Article_published_articleType_idx" ON "Article"("published", "articleType");

-- CreateIndex
CREATE INDEX "Article_matchId_idx" ON "Article"("matchId");

-- CreateIndex
CREATE INDEX "Article_matchDate_idx" ON "Article"("matchDate");

-- CreateIndex
CREATE INDEX "Article_isHero_idx" ON "Article"("isHero");
