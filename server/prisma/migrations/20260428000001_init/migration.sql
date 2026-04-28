-- CreateTable
CREATE TABLE "Map" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "embedToken" TEXT,
    "centerLat" DOUBLE PRECISION NOT NULL DEFAULT 57.7089,
    "centerLng" DOUBLE PRECISION NOT NULL DEFAULT 11.9746,
    "defaultZoom" INTEGER NOT NULL DEFAULT 12,
    "minZoom" INTEGER,
    "tileLayer" TEXT NOT NULL DEFAULT 'osm',
    "clusterMarkers" BOOLEAN NOT NULL DEFAULT false,
    "showMinimap" BOOLEAN NOT NULL DEFAULT false,
    "showScaleBar" BOOLEAN NOT NULL DEFAULT true,
    "filterDarkMode" BOOLEAN NOT NULL DEFAULT false,
    "hiddenFilterKeys" TEXT,
    "popupBg" TEXT,
    "popupTextColor" TEXT,
    "clusterColor" TEXT,
    "clusterBorderColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "icon" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marker" (
    "id" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "categoryId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3),
    "imageUrl" TEXT,
    "genderVictim" TEXT,
    "ageVictim" DOUBLE PRECISION,
    "genderPerpetrator" TEXT,
    "punishment" TEXT,
    "punishmentYears" DOUBLE PRECISION,
    "region" TEXT,
    "customFields" TEXT,
    "shape" TEXT NOT NULL DEFAULT 'pin',
    "markerSize" TEXT NOT NULL DEFAULT 'md',
    "markerIcon" TEXT,
    "color" TEXT,
    "strokeColor" TEXT,
    "strokeWidth" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "opacity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Marker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shape" (
    "id" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "categoryId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#2563eb',
    "weight" INTEGER NOT NULL DEFAULT 3,
    "fillColor" TEXT,
    "fillOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "opacity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shape_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarkerImage" (
    "id" TEXT NOT NULL,
    "markerId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarkerImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Map_embedToken_key" ON "Map"("embedToken");

-- CreateIndex
CREATE UNIQUE INDEX "Category_mapId_name_key" ON "Category"("mapId", "name");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marker" ADD CONSTRAINT "Marker_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marker" ADD CONSTRAINT "Marker_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shape" ADD CONSTRAINT "Shape_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shape" ADD CONSTRAINT "Shape_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkerImage" ADD CONSTRAINT "MarkerImage_markerId_fkey" FOREIGN KEY ("markerId") REFERENCES "Marker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

