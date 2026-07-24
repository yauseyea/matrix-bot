import { createRequire } from 'module';

import { Router, Request, Response } from 'express';
const require = createRequire(import.meta.url);
const { version } = require('../../package.json') as { version: string };

const router = Router();

/**
 * GET /health - Health check endpoint
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version,
  });
});

export default router;
