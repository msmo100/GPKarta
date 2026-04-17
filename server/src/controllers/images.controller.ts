import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { AppError } from '../utils/errors';
import { config } from '../config';

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    const marker = await db.marker.findUnique({ where: { id: req.params.markerId } });
    if (!marker) throw AppError.notFound('Marker not found');
    if (!req.file) throw AppError.badRequest('No file uploaded');

    const count = await db.markerImage.count({ where: { markerId: req.params.markerId } });
    const url = `/uploads/${req.file.filename}`;
    const image = await db.markerImage.create({
      data: { markerId: req.params.markerId, filename: req.file.filename, url, order: count },
    });
    res.status(201).json({ data: image });
  } catch (err) {
    next(err);
  }
}

export async function deleteImage(req: Request, res: Response, next: NextFunction) {
  try {
    const image = await db.markerImage.findUnique({ where: { id: req.params.imageId } });
    if (!image) throw AppError.notFound('Image not found');

    const filePath = path.join(config.uploadDir, image.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.markerImage.delete({ where: { id: req.params.imageId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function reorderImage(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({ order: z.number().int().min(0) });
    const { order } = schema.parse(req.body);

    const image = await db.markerImage.findUnique({ where: { id: req.params.imageId } });
    if (!image) throw AppError.notFound('Image not found');

    const updated = await db.markerImage.update({ where: { id: req.params.imageId }, data: { order } });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}
