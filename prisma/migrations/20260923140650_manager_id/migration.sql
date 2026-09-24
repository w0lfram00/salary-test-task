-- DropForeignKey
ALTER TABLE "Worker" DROP CONSTRAINT "Worker_managerId_fkey";

-- AlterTable
ALTER TABLE "Worker" ALTER COLUMN "managerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
