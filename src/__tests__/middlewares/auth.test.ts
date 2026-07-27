import { Request, Response, NextFunction } from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/config.js', () => ({
  config: {
    auth: {
      apiKeys: ['valid-key-1', 'valid-key-2'],
    },
  },
}));

import { apiKeyAuth } from '../../middlewares/auth.js';

describe('apiKeyAuth', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));
    req = { headers: {} };
    res = { status: statusMock };
    next = vi.fn();
  });

  it('returns 401 when no api key is provided', () => {
    apiKeyAuth(req as Request, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'API key is required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when the api key is invalid', () => {
    req.headers = { 'x-api-key': 'bad-key' };
    apiKeyAuth(req as Request, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid API key' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when the api key is valid', () => {
    req.headers = { 'x-api-key': 'valid-key-1' };
    apiKeyAuth(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });
});
