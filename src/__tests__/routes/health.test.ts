import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest'; // npm i -D supertest @types/supertest
import healthRouter from '../../routes/health.js';

const app = express();
app.use('/health', healthRouter);

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.version).toBeDefined();
  });
});
