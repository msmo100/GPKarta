-- CreateTable
CREATE TABLE "Shape" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mapId" TEXT NOT NULL,
    "categoryId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#2563eb',
    "weight" INTEGER NOT NULL DEFAULT 3,
    "fillColor" TEXT,
    "fillOpacity" REAL NOT NULL DEFAULT 0.2,
    "opacity" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shape_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Shape_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Map" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "embedToken" TEXT,
    "centerLat" REAL NOT NULL DEFAULT 57.7089,
    "centerLng" REAL NOT NULL DEFAULT 11.9746,
    "defaultZoom" INTEGER NOT NULL DEFAULT 12,
    "tileLayer" TEXT NOT NULL DEFAULT 'osm',
    "clusterMarkers" BOOLEAN NOT NULL DEFAULT false,
    "showMinimap" BOOLEAN NOT NULL DEFAULT false,
    "showScaleBar" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Map_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Map" ("centerLat", "centerLng", "createdAt", "defaultZoom", "description", "embedToken", "id", "isPublic", "ownerId", "tileLayer", "title", "updatedAt") SELECT "centerLat", "centerLng", "createdAt", "defaultZoom", "description", "embedToken", "id", "isPublic", "ownerId", "tileLayer", "title", "updatedAt" FROM "Map";
DROP TABLE "Map";
ALTER TABLE "new_Map" RENAME TO "Map";
CREATE UNIQUE INDEX "Map_embedToken_key" ON "Map"("embedToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
