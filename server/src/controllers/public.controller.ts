import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { AppError } from '../utils/errors';

function parseShape(s: any) {
  return { ...s, coordinates: JSON.parse(s.coordinates) };
}

export async function getPublicMap(req: Request, res: Response, next: NextFunction) {
  try {
    const map = await db.map.findUnique({
      where: { id: req.params.mapId },
      include: {
        categories: true,
        markers: {
          include: {
            images: { orderBy: { order: 'asc' } },
            category: { select: { id: true, name: true, color: true, icon: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        shapes: {
          include: {
            category: { select: { id: true, name: true, color: true, icon: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!map) throw AppError.notFound('Map not found');
    if (!map.isPublic) throw AppError.forbidden();

    const { embedToken, ...publicMap } = map;
    res.json({ data: { ...publicMap, shapes: publicMap.shapes.map(parseShape) } });
  } catch (err) {
    next(err);
  }
}
