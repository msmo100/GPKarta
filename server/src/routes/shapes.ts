import { Router } from 'express';
import { listShapes, createShape, updateShape, deleteShape } from '../controllers/shapes.controller';
import { requireAuth } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get('/', listShapes);
router.post('/', createShape);
router.patch('/:shapeId', updateShape);
router.delete('/:shapeId', deleteShape);

export default router;
