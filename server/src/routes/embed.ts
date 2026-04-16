import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getEmbedData } from '../controllers/embed.controller';

const router = Router();

const embedLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/:embedToken', embedLimiter, getEmbedData);

export default router;
