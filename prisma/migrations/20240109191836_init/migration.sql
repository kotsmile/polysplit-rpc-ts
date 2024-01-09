-- CreateEnum
CREATE TYPE "ChainType" AS ENUM ('EVM');

-- CreateEnum
CREATE TYPE "ChainEnvType" AS ENUM ('MAINNET', 'TESTNET');

-- CreateEnum
CREATE TYPE "RpcType" AS ENUM ('HTTPS');

-- CreateEnum
CREATE TYPE "RpcStatus" AS ENUM ('OK', 'ERROR', 'NONE');

-- CreateTable
CREATE TABLE "Chain" (
    "id" TEXT NOT NULL,
    "type" "ChainType" NOT NULL,
    "env_type" "ChainEnvType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rpc" (
    "id" TEXT NOT NULL,
    "chain_id" TEXT NOT NULL,
    "type" "RpcType" NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rpc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chain_id_key" ON "Chain"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Rpc_id_key" ON "Rpc"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Rpc_url_key" ON "Rpc"("url");

-- AddForeignKey
ALTER TABLE "Rpc" ADD CONSTRAINT "Rpc_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
