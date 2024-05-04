/*
  Warnings:

  - Made the column `phone` on table `Client` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "fullName" TEXT
);
INSERT INTO "new_Client" ("fullName", "id", "phone") SELECT "fullName", "id", "phone" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_phone_key" ON "Client"("phone");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
