import { Router } from 'express';
import authRoutes from './auth';
import mapsRoutes from './maps';
import markersRoutes from './markers';
import shapesRoutes from './shapes';
import categoriesRoutes from './categories';
import imagesRoutes from './images';
import embedRoutes from './embed';
import publicRoutes from './public';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

router.use('/auth', authRoutes);
router.use('/maps', mapsRoutes);
router.use('/maps/:mapId/markers', markersRoutes);
router.use('/maps/:mapId/shapes', shapesRoutes);
router.use('/maps/:mapId/categories', categoriesRoutes);
router.use('/images', imagesRoutes);
router.use('/embed', embedRoutes);
router.use('/public', publicRoutes);

export default router;
