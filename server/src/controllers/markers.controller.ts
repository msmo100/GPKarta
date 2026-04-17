import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { AppError } from '../utils/errors';

const SHAPES = ['pin', 'circle', 'square', 'diamond', 'star'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

const HEX_COLOR = z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional().nullable();

const markerSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  date: z.string().datetime({ offset: true }).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  shape: z.enum(SHAPES).optional(),
  markerSize: z.enum(SIZES).optional(),
  markerIcon: z.string().max(10).optional().nullable(),
  color: HEX_COLOR,
  strokeColor: HEX_COLOR,
  strokeWidth: z.number().min(0).max(10).optional(),
  opacity: z.number().min(0).max(1).optional(),
  videoUrl: z.string().url().max(2000).optional().nullable(),
  imageUrl: z.string().url().max(2000).optional().nullable(),
  genderVictim: z.string().max(100).optional().nullable(),
  ageVictim: z.number().min(0).max(150).optional().nullable(),
  genderPerpetrator: z.string().max(100).optional().nullable(),
  punishment: z.string().max(200).optional().nullable(),
  punishmentYears: z.number().min(0).max(200).optional().nullable(),
  region: z.string().max(200).optional().nullable(),
});

async function assertMapExists(mapId: string) {
  const map = await db.map.findUnique({ where: { id: mapId } });
  if (!map) throw AppError.notFound('Map not found');
  return map;
}

const markerInclude = {
  images: { orderBy: { order: 'asc' as const } },
  category: { select: { id: true, name: true, color: true, icon: true } },
};

export async function listMarkers(req: Request, res: Response, next: NextFunction) {
  try {
    await assertMapExists(req.params.mapId);
    const { categoryId, from, to } = req.query as Record<string, string | undefined>;
    const where: any = { mapId: req.params.mapId };
    if (categoryId) where.categoryId = categoryId;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    const markers = await db.marker.findMany({ where, include: markerInclude, orderBy: { createdAt: 'desc' } });
    res.json({ data: markers });
  } catch (err) {
    next(err);
  }
}

export async function getMarker(req: Request, res: Response, next: NextFunction) {
  try {
    await assertMapExists(req.params.mapId);
    const marker = await db.marker.findFirst({
      where: { id: req.params.markerId, mapId: req.params.mapId },
      include: markerInclude,
    });
    if (!marker) throw AppError.notFound('Marker not found');
    res.json({ data: marker });
  } catch (err) {
    next(err);
  }
}

export async function createMarker(req: Request, res: Response, next: NextFunction) {
  try {
    await assertMapExists(req.params.mapId);
    const data = markerSchema.parse(req.body);
    const marker = await db.marker.create({
      data: { ...data, date: data.date ? new Date(data.date) : null, mapId: req.params.mapId },
      include: markerInclude,
    });
    res.status(201).json({ data: marker });
  } catch (err) {
    next(err);
  }
}

export async function updateMarker(req: Request, res: Response, next: NextFunction) {
  try {
    await assertMapExists(req.params.mapId);
    const existing = await db.marker.findFirst({ where: { id: req.params.markerId, mapId: req.params.mapId } });
    if (!existing) throw AppError.notFound('Marker not found');
    const data = markerSchema.partial().parse(req.body);
    const marker = await db.marker.update({
      where: { id: req.params.markerId },
      data: { ...data, date: data.date !== undefined ? (data.date ? new Date(data.date) : null) : undefined },
      include: markerInclude,
    });
    res.json({ data: marker });
  } catch (err) {
    next(err);
  }
}

export async function deleteMarker(req: Request, res: Response, next: NextFunction) {
  try {
    await assertMapExists(req.params.mapId);
    const existing = await db.marker.findFirst({ where: { id: req.params.markerId, mapId: req.params.mapId } });
    if (!existing) throw AppError.notFound('Marker not found');
    await db.marker.delete({ where: { id: req.params.markerId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function bulkCreateMarkers(req: Request, res: Response, next: NextFunction) {
  try {
    await assertMapExists(req.params.mapId);
    const bulkSchema = z.object({ markers: z.array(markerSchema).min(1).max(2000) });
    const { markers } = bulkSchema.parse(req.body);
    const created = await db.$transaction(
      markers.map((m) =>
        db.marker.create({
          data: { ...m, date: m.date ? new Date(m.date) : null, mapId: req.params.mapId },
          include: markerInclude,
        }),
      ),
    );
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
}

const styleSchema = z.object({
  shape: z.enum(SHAPES).optional(),
  markerSize: z.enum(SIZES).optional(),
  markerIcon: z.string().max(10).optional().nullable(),
  color: HEX_COLOR,
  strokeColor: HEX_COLOR,
  strokeWidth: z.number().min(0).max(10).optional(),
  opacity: z.number().min(0).max(1).optional(),
});

export async function bulkStyleMarkers(req: Request, res: Response, next: NextFunction) {
  try {
    await assertMapExists(req.params.mapId);
    const data = styleSchema.parse(req.body);
    const result = await db.marker.updateMany({
      where: { mapId: req.params.mapId },
      data,
    });
    res.json({ data: { updated: result.count } });
  } catch (err) {
    next(err);
  }
}
