import { Request, Response, NextFunction } from 'express';

import { config } from '../config/config.js';

const API_KEYS = config.auth.apiKeys;

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }

  if (!API_KEYS.includes(apiKey)) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
};
