import { Router } from 'express';
import {
  listMaps,
  getMap,
  createMap,
  updateMap,
  deleteMap,
  duplicateMap,
  generateEmbedToken,
  revokeEmbedToken,
} from '../controllers/maps.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', listMaps);
router.post('/', createMap);
router.get('/:mapId', getMap);
router.patch('/:mapId', updateMap);
router.delete('/:mapId', deleteMap);
router.post('/:mapId/duplicate', duplicateMap);
router.post('/:mapId/embed-token', generateEmbedToken);
router.delete('/:mapId/embed-token', revokeEmbedToken);

export default router;
