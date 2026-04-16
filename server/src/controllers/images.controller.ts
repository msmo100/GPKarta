import { Response, NextFunction } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { AppError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';
import { config } from '../config';

async function assertMarkerOwner(markerId: string, userId: string) {
  const marker = await db.marker.findUnique({
    where: { id: markerId },
    include: { map: true },
  });
  if (!marker) throw AppError.notFound('Marker not found');
  if (marker.map.ownerId !== userId) throw AppError.forbidden();
  return marker;
}

export async function uploadImage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await assertMarkerOwner(req.params.markerId, req.user!.id);
    if (!req.file) throw AppError.badRequest('No file uploaded');

    const count = await db.markerImage.count({ where: { markerId: req.params.markerId } });
    const url = `/uploads/${req.file.filename}`;

    const image = await db.markerImage.create({
      data: {
        markerId: req.params.markerId,
        filename: req.file.filename,
        url,
        order: count,
      },
    });
    res.status(201).json({ data: image });
  } catch (err) {
    next(err);
  }
}

export async function deleteImage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const image = await db.markerImage.findUnique({
      where: { id: req.params.imageId },
      include: { marker: { include: { map: true } } },
    });
    if (!image) throw AppError.notFound('Image not found');
    if (image.marker.map.ownerId !== req.user!.id) throw AppError.forbidden();

    const filePath = path.join(config.uploadDir, image.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.markerImage.delete({ where: { id: req.params.imageId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function reorderImage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const schema = z.object({ order: z.number().int().min(0) });
    const { order } = schema.parse(req.body);

    const image = await db.markerImage.findUnique({
      where: { id: req.params.imageId },
      include: { marker: { include: { map: true } } },
    });
    if (!image) throw AppError.notFound('Image not found');
    if (image.marker.map.ownerId !== req.user!.id) throw AppError.forbidden();

    const updated = await db.markerImage.update({
      where: { id: req.params.imageId },
      data: { order },
    });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}
