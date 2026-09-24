-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('EMPLOYEE', 'MANAGER', 'SALES');

-- CreateTable
CREATE TABLE "Worker" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WorkType" NOT NULL,
    "managerId" UUID NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
