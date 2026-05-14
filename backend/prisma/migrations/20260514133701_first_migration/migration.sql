-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "category" AS ENUM ('ABARROTES', 'PERECEDEROS', 'LACTEOS', 'LIMPIEZA', 'CUIDADO_PERSONAL', 'BEBIDAS');

-- CreateEnum
CREATE TYPE "voucherType" AS ENUM ('BOLETA', 'FACTURA');

-- CreateEnum
CREATE TYPE "sellStatus" AS ENUM ('CANCELADO', 'EN_PROCESO', 'ANULADO');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "typeUser" "UserType" NOT NULL DEFAULT 'VENDEDOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "dni" TEXT,
    "ruc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bars_code" TEXT,
    "lote" TEXT,
    "category" "category" NOT NULL DEFAULT 'ABARROTES',
    "price_adquired" DECIMAL NOT NULL,
    "minor_price" DECIMAL NOT NULL,
    "wholesale_price" DECIMAL NOT NULL,
    "limit_minor_adquirition" INTEGER NOT NULL DEFAULT 5,
    "revenue_margin" DECIMAL NOT NULL,
    "current_stock" INTEGER NOT NULL,
    "alert_stock" INTEGER NOT NULL DEFAULT 5,
    "expiration_date" TIMESTAMP(3),
    "production_date" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sells" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_client" TEXT,
    "voucherType" "voucherType" NOT NULL DEFAULT 'BOLETA',
    "sellStatus" "sellStatus" NOT NULL DEFAULT 'CANCELADO',
    "total" DECIMAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellDetails" (
    "id" TEXT NOT NULL,
    "id_sell" TEXT NOT NULL,
    "id_product" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "sub_total" DECIMAL NOT NULL,
    "original_price" DECIMAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_dni_key" ON "Clients"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Products_bars_code_key" ON "Products"("bars_code");

-- AddForeignKey
ALTER TABLE "sells" ADD CONSTRAINT "sells_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sells" ADD CONSTRAINT "sells_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "Clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellDetails" ADD CONSTRAINT "SellDetails_id_sell_fkey" FOREIGN KEY ("id_sell") REFERENCES "sells"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellDetails" ADD CONSTRAINT "SellDetails_id_product_fkey" FOREIGN KEY ("id_product") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
