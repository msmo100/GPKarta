import { Router } from 'express';
import { listShapes, createShape, updateShape, deleteShape } from '../controllers/shapes.controller';

const router = Router({ mergeParams: true });

router.get('/', listShapes);
router.post('/', createShape);
router.patch('/:shapeId', updateShape);
router.delete('/:shapeId', deleteShape);

export default router;
