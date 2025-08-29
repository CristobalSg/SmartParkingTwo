/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,email]` on the table `administrators` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,name]` on the table `parking_zones` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenant_id` to the `administrators` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `parking_zones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "administrators_email_key";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "administrators" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "parking_zones" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "tenant_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_tenant_id_key" ON "tenants"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "tenants"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "administrators_tenant_id_email_key" ON "administrators"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "parking_zones_tenant_id_name_key" ON "parking_zones"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- AddForeignKey
ALTER TABLE "administrators" ADD CONSTRAINT "administrators_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_zones" ADD CONSTRAINT "parking_zones_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
