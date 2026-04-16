import { Router } from 'express';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categories.controller';
import { requireAuth } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get('/', listCategories);
router.post('/', createCategory);
router.patch('/:categoryId', updateCategory);
router.delete('/:categoryId', deleteCategory);

export default router;
