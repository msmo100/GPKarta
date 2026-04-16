import { Router } from 'express';
import { getPublicMap } from '../controllers/public.controller';

const router = Router();

router.get('/maps/:mapId', getPublicMap);

export default router;
