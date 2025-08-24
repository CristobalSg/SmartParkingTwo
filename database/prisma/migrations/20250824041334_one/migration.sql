-- CreateEnum
CREATE TYPE "ParkingSpecialType" AS ENUM ('regular', 'disabled', 'pregnant', 'electric', 'visitor');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired');

-- CreateTable
CREATE TABLE "administrators" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administrators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_zones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "capacity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parking_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_spaces" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "zone_id" UUID NOT NULL,
    "space_number" VARCHAR(10) NOT NULL,
    "special_type" "ParkingSpecialType" NOT NULL DEFAULT 'regular',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parking_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "parking_space_id" UUID NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'pending',
    "reserved_from" TIMESTAMP(3) NOT NULL,
    "reserved_until" TIMESTAMP(3) NOT NULL,
    "special_needs" "ParkingSpecialType" NOT NULL DEFAULT 'regular',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrators_email_key" ON "administrators"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "parking_spaces_zone_id_space_number_key" ON "parking_spaces"("zone_id", "space_number");

-- AddForeignKey
ALTER TABLE "parking_spaces" ADD CONSTRAINT "parking_spaces_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "parking_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_parking_space_id_fkey" FOREIGN KEY ("parking_space_id") REFERENCES "parking_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
