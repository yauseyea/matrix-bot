import { Router } from 'express';

import { apiKeyAuth } from '../middlewares/auth.js';
import healthRouter from './health.js';
import matrixRouter from './matrix.js';
import metricsRouter from './metrics.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/metrics', metricsRouter);
router.use('/matrix', apiKeyAuth, matrixRouter);

export default router;
