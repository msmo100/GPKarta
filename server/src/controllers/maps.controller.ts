import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { AppError } from '../utils/errors';

const TILE_LAYERS = ['osm', 'carto-light', 'carto-light-nolabels', 'carto-dark', 'carto-dark-nolabels', 'carto-voyager', 'esri-satellite', 'esri-topo', 'esri-ocean', 'opentopomap'] as const;

const createMapSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  isPublic: z.boolean().optional(),
  centerLat: z.number().min(-90).max(90).optional(),
  centerLng: z.number().min(-180).max(180).optional(),
  defaultZoom: z.number().int().min(1).max(20).optional(),
  minZoom: z.number().int().min(1).max(18).optional().nullable(),
  tileLayer: z.enum(TILE_LAYERS).optional(),
  clusterMarkers: z.boolean().optional(),
  clusterColor: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional().nullable(),
  clusterBorderColor: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional().nullable(),
  showMinimap: z.boolean().optional(),
  showScaleBar: z.boolean().optional(),
  popupBg: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional().nullable(),
  popupTextColor: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional().nullable(),
  filterDarkMode: z.boolean().optional(),
  hiddenFilterKeys: z.array(z.string()).optional().nullable(),
});

const updateMapSchema = createMapSchema.partial();

export async function listMaps(req: Request, res: Response, next: NextFunction) {
  try {
    const maps = await db.map.findMany({
      include: { _count: { select: { markers: true, categories: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ data: maps });
  } catch (err) {
    next(err);
  }
}

export async function getMap(req: Request, res: Response, next: NextFunction) {
  try {
    const map = await db.map.findUnique({
      where: { id: req.params.mapId },
      include: { categories: true, _count: { select: { markers: true } } },
    });
    if (!map) throw AppError.notFound('Map not found');
    res.json({ data: map });
  } catch (err) {
    next(err);
  }
}

export async function createMap(req: Request, res: Response, next: NextFunction) {
  try {
    const { hiddenFilterKeys, ...rest } = createMapSchema.parse(req.body);
    const dbData: any = { ...rest };
    if (hiddenFilterKeys !== undefined) dbData.hiddenFilterKeys = hiddenFilterKeys !== null ? JSON.stringify(hiddenFilterKeys) : null;
    const map = await db.map.create({ data: dbData }) as any;
    res.status(201).json({ data: { ...map, hiddenFilterKeys: map.hiddenFilterKeys ? JSON.parse(map.hiddenFilterKeys) : null } });
  } catch (err) {
    next(err);
  }
}

export async function updateMap(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await db.map.findUnique({ where: { id: req.params.mapId } });
    if (!existing) throw AppError.notFound('Map not found');
    const { hiddenFilterKeys, ...rest } = updateMapSchema.parse(req.body);
    const dbData: any = { ...rest };
    if (hiddenFilterKeys !== undefined) dbData.hiddenFilterKeys = hiddenFilterKeys !== null ? JSON.stringify(hiddenFilterKeys) : null;
    const map = await db.map.update({ where: { id: req.params.mapId }, data: dbData }) as any;
    res.json({ data: { ...map, hiddenFilterKeys: map.hiddenFilterKeys ? JSON.parse(map.hiddenFilterKeys) : null } });
  } catch (err) {
    next(err);
  }
}

export async function deleteMap(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await db.map.findUnique({ where: { id: req.params.mapId } });
    if (!existing) throw AppError.notFound('Map not found');
    await db.map.delete({ where: { id: req.params.mapId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function duplicateMap(req: Request, res: Response, next: NextFunction) {
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

    const { id, embedToken, createdAt, updatedAt, categories, markers, shapes, ...mapData } = existing;

    const newMap = await db.map.create({
      data: { ...mapData, title: `${existing.title} (copy)` },
    });

    const catIdMap: Record<string, string> = {};
    for (const cat of categories) {
      const { id: cid, mapId: _m, ...catData } = cat;
      const newCat = await db.category.create({ data: { ...catData, mapId: newMap.id } });
      catIdMap[cid] = newCat.id;
    }

    for (const marker of markers) {
      const { id: _mid, mapId: _m, categoryId, images, createdAt: _ca, updatedAt: _ua, ...markerData } = marker;
      await db.marker.create({
        data: { ...markerData, mapId: newMap.id, categoryId: categoryId ? (catIdMap[categoryId] ?? null) : null },
      });
    }

    for (const shape of shapes) {
      const { id: _sid, mapId: _m, categoryId, createdAt: _ca, updatedAt: _ua, ...shapeData } = shape;
      await db.shape.create({
        data: { ...shapeData, mapId: newMap.id, categoryId: categoryId ? (catIdMap[categoryId] ?? null) : null },
      });
    }

    res.status(201).json({ data: newMap });
  } catch (err) {
    next(err);
  }
}

export async function generateEmbedToken(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await db.map.findUnique({ where: { id: req.params.mapId } });
    if (!existing) throw AppError.notFound('Map not found');
    const embedToken = uuidv4();
    const map = await db.map.update({ where: { id: req.params.mapId }, data: { embedToken } });
    res.json({ data: { embedToken: map.embedToken } });
  } catch (err) {
    next(err);
  }
}

export async function revokeEmbedToken(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await db.map.findUnique({ where: { id: req.params.mapId } });
    if (!existing) throw AppError.notFound('Map not found');
    await db.map.update({ where: { id: req.params.mapId }, data: { embedToken: null } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
