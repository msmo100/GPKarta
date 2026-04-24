import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { AppError } from '../utils/errors';

function parseShape(s: any) {
  return { ...s, coordinates: JSON.parse(s.coordinates) };
}

export async function getEmbedData(req: Request, res: Response, next: NextFunction) {
  try {
    const map = await db.map.findUnique({
      where: { embedToken: req.params.embedToken },
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

    if (!map) throw AppError.notFound('Embed not found');

    const { embedToken, ...publicMap } = map as any;
    res.json({ data: { ...publicMap, hiddenFilterKeys: publicMap.hiddenFilterKeys ? JSON.parse(publicMap.hiddenFilterKeys) : null, shapes: publicMap.shapes.map(parseShape) } });
  } catch (err) {
    next(err);
  }
}
