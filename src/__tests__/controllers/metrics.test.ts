import { describe, it, expect, beforeEach } from 'vitest';

import { Metrics } from '../../controllers/metricsController.js';

describe('Metrics', () => {
  let metrics: Metrics;

  beforeEach(() => {
    metrics = new Metrics({ name: 'test-app', environment: 'local' });
  });

  it('returns prometheus text format', async () => {
    const result = await metrics.getMetrics();
    expect(result).toMatch(/^up\{[^}]+\} 1$/m);
  });

  it('marks down correctly', async () => {
    metrics.markDown();
    const result = await metrics.getMetrics();
    expect(result).toMatch(/^up\{[^}]+\} 0$/m);
  });

  it('returns correct content type', () => {
    expect(metrics.getContentType()).toContain('text/plain');
  });

  it('exposes the registry', () => {
    expect(metrics.getRegistry()).toBeDefined();
  });

  it('fromConfig factory sets name and environment from appConfig', async () => {
    const m = Metrics.fromConfig({
      environment: 'prod',
      logger: { name: 'my-service', streams: {} as any, environment: 'prod' },
      app: { port: 3000 },
      matrix: {
        url: '...',
        name: '...',
        asToken: '...',
        hsToken: '...',
        botLocalPart: '...',
        configPath: '...',
      },
      webhookService: {
        url: '...',
        apiKey: '...',
      },
      auth: {
        apiKeys: [],
      },
    });
    const text = await m.getMetrics();
    expect(text).toContain('app="my-service"');
    expect(text).toContain('env="prod"');
  });

  it('does not leak metrics between separate instances', async () => {
    const other = new Metrics({ name: 'other-app', environment: 'local' });
    const text = await other.getMetrics();
    expect(text).toContain('app="other-app"');
    expect(text).not.toContain('app="test-app"');
  });

  it('markDown is idempotent', async () => {
    metrics.markDown();
    metrics.markDown();
    const result = await metrics.getMetrics();
    expect(result).toMatch(/^up\{[^}]+\} 0$/m);
  });
});
