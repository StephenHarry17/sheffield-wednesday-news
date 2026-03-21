-- CreateTable
CREATE TABLE "LeagueTableEntry" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "playedGames" INTEGER NOT NULL,
    "won" INTEGER NOT NULL,
    "draw" INTEGER NOT NULL,
    "lost" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "goalsFor" INTEGER NOT NULL,
    "goalsAgainst" INTEGER NOT NULL,
    "goalDifference" INTEGER NOT NULL,
    "form" TEXT,
    "competition" TEXT NOT NULL,
    "season" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueTableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeagueTableEntry_competition_position_idx" ON "LeagueTableEntry"("competition", "position");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueTableEntry_competition_teamId_key" ON "LeagueTableEntry"("competition", "teamId");
