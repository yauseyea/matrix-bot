import { Router } from 'express';

import { Matrix } from '../controllers/matrixController.js';

const router = Router();
const matrix = new Matrix();

/**
 * GET /matrix - matrix endpoint
 */
router.post('/message', matrix.sendMessage);

export default router;
