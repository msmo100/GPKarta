import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { AppError } from '../utils/errors';

const shapeSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  description: z.string().max(10000).optional().nullable(),
  type: z.enum(['polyline', 'polygon']),
  coordinates: z.array(z.tuple([z.number(), z.number()])).min(2),
  color: z.string().max(20).optional(),
  weight: z.number().int().min(1).max(20).optional(),
  fillColor: z.string().max(20).optional().nullable(),
  fillOpacity: z.number().min(0).max(1).optional(),
  opacity: z.number().min(0).max(1).optional(),
  categoryId: z.string().optional().nullable(),
});

async function assertMapExists(mapId: string) {
  const map = await db.map.findUnique({ where: { id: mapId } });
  if (!map) throw AppError.notFound('Map not found');
  return map;
}

const shapeInclude = {
  category: { select: { id: true, name: true, color: true, icon: true } },
};

function parseShape(s: any) {
  return { ...s, coordinates: JSON.parse(s.coordinates) };
}

export async function listShapes(req: Request, res: Response, next: NextFunction) {
  try {
    await assertMapExists(req.params.mapId);
    const shapes = await db.shape.findMany({
      where: { mapId: req.params.mapId },
      include: shapeInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: shapes.map(parseShape) });
  } catch (err) {
    next(err);
  }
}

export async function createShape(req: Request, res: Response, next: NextFunction) {
  try {
    await assertMapExists(req.params.mapId);
    const data = shapeSchema.parse(req.body);
    const shape = await db.shape.create({
      data: { ...data, coordinates: JSON.stringify(data.coordinates), mapId: req.params.mapId },
      include: shapeInclude,
    });
    res.status(201).json({ data: parseShape(shape) });
  } catch (err) {
    next(err);
  }
}

export async function updateShape(req: Request, res: Response, next: NextFunction) {
  try {
    await assertMapExists(req.params.mapId);
    const existing = await db.shape.findFirst({ where: { id: req.params.shapeId, mapId: req.params.mapId } });
    if (!existing) throw AppError.notFound('Shape not found');
    const data = shapeSchema.partial().parse(req.body);
    const shape = await db.shape.update({
      where: { id: req.params.shapeId },
      data: { ...data, coordinates: data.coordinates ? JSON.stringify(data.coordinates) : undefined },
      include: shapeInclude,
    });
    res.json({ data: parseShape(shape) });
  } catch (err) {
    next(err);
  }
}

export async function deleteShape(req: Request, res: Response, next: NextFunction) {
  try {
    await assertMapExists(req.params.mapId);
    const existing = await db.shape.findFirst({ where: { id: req.params.shapeId, mapId: req.params.mapId } });
    if (!existing) throw AppError.notFound('Shape not found');
    await db.shape.delete({ where: { id: req.params.shapeId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
