import { Registry, Gauge, collectDefaultMetrics } from 'prom-client';
import type { AppConfig } from '../config/config.interface.js';

export class Metrics {
  private registry: Registry;
  private upGauge: Gauge;

  constructor(config: Pick<AppConfig, 'environment'> & { name: string }) {
    this.registry = new Registry();

    // Default labels attached to every metric
    this.registry.setDefaultLabels({
      app: config.name,
      env: config.environment,
    });

    // Collect default Node.js runtime metrics (heap, event loop, gc, etc.)
    collectDefaultMetrics({ register: this.registry });

    // Application liveness gauge — 1 = up, 0 = down
    this.upGauge = new Gauge({
      name: 'up',
      help: 'Whether the application is running (1 = up, 0 = down)',
      registers: [this.registry],
    });

    // Mark as up immediately on construction
    this.upGauge.set(1);
  }

  static fromConfig(appConfig: AppConfig): Metrics {
    return new Metrics({
      name: appConfig.logger.name,
      environment: appConfig.environment,
    });
  }

  /**
   * Call this on graceful shutdown so the last scrape before the process
   * exits reports 0 instead of just disappearing.
   */
  markDown(): void {
    this.upGauge.set(0);
  }

  /**
   * Returns the Prometheus text exposition format.
   * Mount this on GET /metrics in your HTTP server.
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Content-type header value to set on the /metrics response.
   */
  getContentType(): string {
    return this.registry.contentType;
  }

  /**
   * Expose the raw registry if you need to register additional
   * metrics (Counters, Histograms, etc.) elsewhere in the app.
   */
  getRegistry(): Registry {
    return this.registry;
  }
}
