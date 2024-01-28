-- CreateEnum
CREATE TYPE "StatsStatus" AS ENUM ('OK', 'ERROR');

-- CreateTable
CREATE TABLE "Stats" (
    "id" SERIAL NOT NULL,
    "chainId" TEXT NOT NULL,
    "status" "StatsStatus" NOT NULL,
    "responseTimeMs" INTEGER NOT NULL,
    "choosenRpc" TEXT NOT NULL,
    "ip" TEXT,
    "isLanding" BOOLEAN NOT NULL,
    "attempts" INTEGER NOT NULL,
    "errorMessage" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("id")
);
