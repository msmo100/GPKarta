import { Router } from 'express';
import { listMarkers, getMarker, createMarker, updateMarker, deleteMarker, bulkCreateMarkers, bulkStyleMarkers } from '../controllers/markers.controller';

const router = Router({ mergeParams: true });

router.get('/', listMarkers);
router.post('/', createMarker);
router.post('/bulk', bulkCreateMarkers);
router.patch('/bulk-style', bulkStyleMarkers);
router.get('/:markerId', getMarker);
router.patch('/:markerId', updateMarker);
router.delete('/:markerId', deleteMarker);

export default router;
