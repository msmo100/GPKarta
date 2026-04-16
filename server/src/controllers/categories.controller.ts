import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { AppError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
});

async function assertMapOwner(mapId: string, userId: string) {
  const map = await db.map.findUnique({ where: { id: mapId } });
  if (!map) throw AppError.notFound('Map not found');
  if (map.ownerId !== userId) throw AppError.forbidden();
  return map;
}

export async function listCategories(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await assertMapOwner(req.params.mapId, req.user!.id);
    const categories = await db.category.findMany({
      where: { mapId: req.params.mapId },
      orderBy: { name: 'asc' },
    });
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await assertMapOwner(req.params.mapId, req.user!.id);
    const data = categorySchema.parse(req.body);
    const category = await db.category.create({
      data: { ...data, mapId: req.params.mapId },
    });
    res.status(201).json({ data: category });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await assertMapOwner(req.params.mapId, req.user!.id);
    const existing = await db.category.findFirst({
      where: { id: req.params.categoryId, mapId: req.params.mapId },
    });
    if (!existing) throw AppError.notFound('Category not found');

    const data = categorySchema.partial().parse(req.body);
    const category = await db.category.update({
      where: { id: req.params.categoryId },
      data,
    });
    res.json({ data: category });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await assertMapOwner(req.params.mapId, req.user!.id);
    const existing = await db.category.findFirst({
      where: { id: req.params.categoryId, mapId: req.params.mapId },
    });
    if (!existing) throw AppError.notFound('Category not found');

    await db.category.delete({ where: { id: req.params.categoryId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
