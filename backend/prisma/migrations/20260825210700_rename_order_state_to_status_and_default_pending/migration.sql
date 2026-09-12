/*
  Warnings:

  - You are about to drop the column `state` on the `Orders` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderStatuses" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Customers" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Employees" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "state",
ADD COLUMN     "status" "OrderStatuses" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropEnum
DROP TYPE "OrderStates";
