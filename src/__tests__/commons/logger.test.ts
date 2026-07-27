import { describe, it, expect, vi } from 'vitest';

const fromConfigMock = vi.fn().mockReturnValue({ info: vi.fn(), error: vi.fn(), trace: vi.fn() });

vi.mock('@yauseyea/node-observability/logger', () => ({
  Logger: {
    fromConfig: fromConfigMock,
  },
}));

vi.mock('../../config/config.js', () => ({
  config: {
    logger: {
      name: 'my-service',
      streams: {
        console: { level: 'info', prettyPrint: true },
        loki: { level: 'warn', url: 'http://loki.local' },
      },
    },
    environment: 'test',
  },
}));

describe('logger', () => {
  it('builds the logger from config', async () => {
    const { log } = await import('../../commons/logger.js');

    expect(fromConfigMock).toHaveBeenCalledWith({
      name: 'my-service',
      environment: 'test',
      streams: {
        console: { level: 'info', prettyPrint: true },
        loki: { level: 'warn', url: 'http://loki.local' },
      },
    });
    expect(log).toBeDefined();
  });
});
