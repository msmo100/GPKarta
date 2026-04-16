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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Map_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Map" ("centerLat", "centerLng", "createdAt", "defaultZoom", "description", "embedToken", "id", "isPublic", "ownerId", "title", "updatedAt") SELECT "centerLat", "centerLng", "createdAt", "defaultZoom", "description", "embedToken", "id", "isPublic", "ownerId", "title", "updatedAt" FROM "Map";
DROP TABLE "Map";
ALTER TABLE "new_Map" RENAME TO "Map";
CREATE UNIQUE INDEX "Map_embedToken_key" ON "Map"("embedToken");
CREATE TABLE "new_Marker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mapId" TEXT NOT NULL,
    "categoryId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "date" DATETIME,
    "shape" TEXT NOT NULL DEFAULT 'pin',
    "markerSize" TEXT NOT NULL DEFAULT 'md',
    "markerIcon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Marker_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Marker_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Marker" ("categoryId", "createdAt", "date", "description", "id", "lat", "lng", "mapId", "title", "updatedAt") SELECT "categoryId", "createdAt", "date", "description", "id", "lat", "lng", "mapId", "title", "updatedAt" FROM "Marker";
DROP TABLE "Marker";
ALTER TABLE "new_Marker" RENAME TO "Marker";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
