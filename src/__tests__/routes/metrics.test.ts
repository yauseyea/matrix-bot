import express from 'express';
import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';

const { getMetricsMock, getContentTypeMock, fromConfigMock } = vi.hoisted(() => ({
  getMetricsMock: vi.fn().mockResolvedValue('# HELP metrics\nfoo 1\n'),
  getContentTypeMock: vi.fn().mockReturnValue('text/plain; version=0.0.4'),
  fromConfigMock: vi.fn(),
}));

vi.mock('../../config/config.js', () => ({
  config: {},
}));

vi.mock('../../controllers/metricsController.js', () => {
  fromConfigMock.mockReturnValue({
    getContentType: getContentTypeMock,
    getMetrics: getMetricsMock,
  });
  return {
    Metrics: {
      fromConfig: fromConfigMock,
    },
  };
});

import metricsRouter from '../../routes/metrics.js';

const app = express();
app.use('/metrics', metricsRouter);

describe('GET /metrics', () => {
  it('returns the metrics payload with the correct content type', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('foo 1');
    expect(getContentTypeMock).toHaveBeenCalled();
    expect(getMetricsMock).toHaveBeenCalled();
  });
});
