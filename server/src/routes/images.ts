import { Router } from 'express';
import { uploadImage, deleteImage, reorderImage } from '../controllers/images.controller';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(requireAuth);

router.post('/marker/:markerId', upload.single('image'), uploadImage);
router.delete('/:imageId', deleteImage);
router.patch('/:imageId/order', reorderImage);

export default router;
