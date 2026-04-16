import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { AppError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';

const TILE_LAYERS = ['osm', 'carto-light', 'carto-light-nolabels', 'carto-dark', 'carto-dark-nolabels'] as const;

const createMapSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  isPublic: z.boolean().optional(),
  centerLat: z.number().min(-90).max(90).optional(),
  centerLng: z.number().min(-180).max(180).optional(),
  defaultZoom: z.number().int().min(1).max(20).optional(),
  tileLayer: z.enum(TILE_LAYERS).optional(),
  clusterMarkers: z.boolean().optional(),
  showMinimap: z.boolean().optional(),
  showScaleBar: z.boolean().optional(),
});

const updateMapSchema = createMapSchema.partial();

export async function listMaps(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const maps = await db.map.findMany({
      where: { ownerId: req.user!.id },
      include: { _count: { select: { markers: true, categories: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ data: maps });
  } catch (err) {
    next(err);
  }
}

export async function getMap(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const map = await db.map.findUnique({
      where: { id: req.params.mapId },
      include: { categories: true, _count: { select: { markers: true } } },
    });
    if (!map) throw AppError.notFound('Map not found');
    if (map.ownerId !== req.user!.id) throw AppError.forbidden();
    res.json({ data: map });
  } catch (err) {
    next(err);
  }
}

export async function createMap(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createMapSchema.parse(req.body);
    const map = await db.map.create({
      data: { ...data, ownerId: req.user!.id },
    });
    res.status(201).json({ data: map });
  } catch (err) {
    next(err);
  }
}

export async function updateMap(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await db.map.findUnique({ where: { id: req.params.mapId } });
    if (!existing) throw AppError.notFound('Map not found');
    if (existing.ownerId !== req.user!.id) throw AppError.forbidden();

    const data = updateMapSchema.parse(req.body);
    const map = await db.map.update({ where: { id: req.params.mapId }, data });
    res.json({ data: map });
  } catch (err) {
    next(err);
  }
}

export async function deleteMap(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await db.map.findUnique({ where: { id: req.params.mapId } });
    if (!existing) throw AppError.notFound('Map not found');
    if (existing.ownerId !== req.user!.id) throw AppError.forbidden();
    await db.map.delete({ where: { id: req.params.mapId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function duplicateMap(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await db.map.findUnique({
      where: { id: req.params.mapId },
      include: {
        categories: true,
        markers: { include: { images: true } },
        shapes: true,
      },
    });
    if (!existing) throw AppError.notFound('Map not found');
    if (existing.ownerId !== req.user!.id) throw AppError.forbidden();

    const { id, ownerId, embedToken, createdAt, updatedAt, categories, markers, shapes, ...mapData } = existing;

    const newMap = await db.map.create({
      data: {
        ...mapData,
        title: `${existing.title} (copy)`,
        ownerId: req.user!.id,
      },
    });

    // Build category id map
    const catIdMap: Record<string, string> = {};
    for (const cat of categories) {
      const { id: cid, mapId: _m, ...catData } = cat;
      const newCat = await db.category.create({ data: { ...catData, mapId: newMap.id } });
      catIdMap[cid] = newCat.id;
    }

    for (const marker of markers) {
      const { id: _mid, mapId: _m, categoryId, images, createdAt: _ca, updatedAt: _ua, ...markerData } = marker;
      await db.marker.create({
        data: {
          ...markerData,
          mapId: newMap.id,
          categoryId: categoryId ? (catIdMap[categoryId] ?? null) : null,
        },
      });
    }

    for (const shape of shapes) {
      const { id: _sid, mapId: _m, categoryId, createdAt: _ca, updatedAt: _ua, ...shapeData } = shape;
      await db.shape.create({
        data: {
          ...shapeData,
          mapId: newMap.id,
          categoryId: categoryId ? (catIdMap[categoryId] ?? null) : null,
        },
      });
    }

    res.status(201).json({ data: newMap });
  } catch (err) {
    next(err);
  }
}

export async function generateEmbedToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await db.map.findUnique({ where: { id: req.params.mapId } });
    if (!existing) throw AppError.notFound('Map not found');
    if (existing.ownerId !== req.user!.id) throw AppError.forbidden();

    const embedToken = uuidv4();
    const map = await db.map.update({
      where: { id: req.params.mapId },
      data: { embedToken },
    });
    res.json({ data: { embedToken: map.embedToken } });
  } catch (err) {
    next(err);
  }
}

export async function revokeEmbedToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await db.map.findUnique({ where: { id: req.params.mapId } });
    if (!existing) throw AppError.notFound('Map not found');
    if (existing.ownerId !== req.user!.id) throw AppError.forbidden();

    await db.map.update({
      where: { id: req.params.mapId },
      data: { embedToken: null },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
