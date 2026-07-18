import { Router, Request, Response } from 'express';

import { config } from '../config/config.js';
import { Metrics } from '../controllers/metricsController.js';

const router = Router();
const metrics = Metrics.fromConfig(config);

/**
 * GET /metrics - Metrics endpoint
 */
router.get('/', async (req: Request, res: Response) => {
  res.set('Content-Type', metrics.getContentType());
  res.send(await metrics.getMetrics());
});

export default router;
