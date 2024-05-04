/*
  Warnings:

  - You are about to drop the column `recivingDate` on the `Order` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serialNumber" TEXT,
    "quantity" INTEGER,
    "receivingDate" DATETIME,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "actualEnd" DATETIME,
    "price" INTEGER,
    "deposit" INTEGER,
    "remaining" INTEGER,
    "progress" INTEGER,
    "clientId" TEXT,
    "technicalId" TEXT,
    CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_technicalId_fkey" FOREIGN KEY ("technicalId") REFERENCES "Technical" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("actualEnd", "clientId", "deposit", "endDate", "id", "price", "progress", "quantity", "remaining", "serialNumber", "startDate", "technicalId") SELECT "actualEnd", "clientId", "deposit", "endDate", "id", "price", "progress", "quantity", "remaining", "serialNumber", "startDate", "technicalId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
