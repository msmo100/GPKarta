import { Router } from 'express';
import {
  listMarkers,
  getMarker,
  createMarker,
  updateMarker,
  deleteMarker,
  bulkCreateMarkers,
} from '../controllers/markers.controller';
import { requireAuth } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get('/', listMarkers);
router.post('/', createMarker);
router.post('/bulk', bulkCreateMarkers);
router.get('/:markerId', getMarker);
router.patch('/:markerId', updateMarker);
router.delete('/:markerId', deleteMarker);

export default router;
