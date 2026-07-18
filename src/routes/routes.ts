import { Router } from 'express';

import healthRouter from './health.js';
import metricsRouter from './metrics.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/metrics', metricsRouter);

export default router;
