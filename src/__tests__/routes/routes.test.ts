import express from 'express';
import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../middlewares/auth.js', () => ({
  apiKeyAuth: vi.fn((req, res, next) => next()),
}));

vi.mock('../../routes/health.js', () => ({
  default: (() => {
    const r = express.Router();
    r.get('/', (req, res) => res.status(200).json({ status: 'ok' }));
    return r;
  })(),
}));

vi.mock('../../routes/metrics.js', () => ({
  default: (() => {
    const r = express.Router();
    r.get('/', (req, res) => res.status(200).send('metrics'));
    return r;
  })(),
}));

vi.mock('../../routes/matrix.js', () => ({
  default: (() => {
    const r = express.Router();
    r.post('/message', (req, res) => res.status(200).json({ ok: true }));
    return r;
  })(),
}));

import { apiKeyAuth } from '../../middlewares/auth.js';
import router from '../../routes/routes.js';

const app = express();
app.use(express.json());
app.use('/', router);

describe('routes', () => {
  it('mounts the health router at /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('mounts the metrics router at /metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
  });

  it('applies apiKeyAuth before the matrix router', async () => {
    const res = await request(app).post('/matrix/message').send({});
    expect(apiKeyAuth).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});
