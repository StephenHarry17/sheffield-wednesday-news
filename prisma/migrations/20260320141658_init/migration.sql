-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "slug" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "articleId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "home" TEXT NOT NULL,
    "away" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "score" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "channelTitle" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL,
    "summary" TEXT,
    "sentiment" TEXT,
    "isBreaking" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakingNewsSummary" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keyPoints" TEXT[],
    "articleIds" TEXT[],
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BreakingNewsSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastFetchedAt" TIMESTAMP(3),
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Video_videoId_key" ON "Video"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_sourceUrl_key" ON "NewsArticle"("sourceUrl");

-- CreateIndex
CREATE INDEX "NewsArticle_source_idx" ON "NewsArticle"("source");

-- CreateIndex
CREATE INDEX "NewsArticle_category_idx" ON "NewsArticle"("category");

-- CreateIndex
CREATE INDEX "NewsArticle_createdAt_idx" ON "NewsArticle"("createdAt");

-- CreateIndex
CREATE INDEX "NewsArticle_isBreaking_idx" ON "NewsArticle"("isBreaking");

-- CreateIndex
CREATE INDEX "BreakingNewsSummary_createdAt_idx" ON "BreakingNewsSummary"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsSource_name_key" ON "NewsSource"("name");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
