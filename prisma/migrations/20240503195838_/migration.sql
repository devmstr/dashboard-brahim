-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT,
    "fullName" TEXT
);

-- CreateTable
CREATE TABLE "Technical" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand" TEXT,
    "model" TEXT,
    "type" TEXT,
    "pas" TEXT,
    "nr" INTEGER,
    "ec" INTEGER,
    "lar1" INTEGER,
    "lon" INTEGER,
    "lar2" INTEGER
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serialNumber" TEXT,
    "quantity" INTEGER,
    "receptionDate" DATETIME,
    "startDate" DATETIME,
    "endDae" DATETIME,
    "actualEnd" DATETIME,
    "price" INTEGER,
    "deposit" INTEGER,
    "remaining" INTEGER,
    "clientId" TEXT,
    "technicalId" TEXT,
    CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_technicalId_fkey" FOREIGN KEY ("technicalId") REFERENCES "Technical" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
