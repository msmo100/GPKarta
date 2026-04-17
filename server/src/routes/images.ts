import { Router } from 'express';
import { uploadImage, deleteImage, reorderImage } from '../controllers/images.controller';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/marker/:markerId', upload.single('image'), uploadImage);
router.delete('/:imageId', deleteImage);
router.patch('/:imageId/order', reorderImage);

export default router;
