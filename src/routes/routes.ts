import { Router } from 'express';

import healthRouter from './health.js';
import matrixRouter from './matrix.js';
import metricsRouter from './metrics.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/metrics', metricsRouter);
router.use('/matrix', matrixRouter);

export default router;
