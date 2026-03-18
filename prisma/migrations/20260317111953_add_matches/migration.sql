-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "opponent" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "competition" TEXT NOT NULL,
    "result" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);
