import { initProfiling } from '@yauseyea/node-observability/profiling';
import { initTracing } from '@yauseyea/node-observability/tracing';

import { config } from './config/config.js';

initProfiling({
  serverAddress: config.logger.streams.profiling.url,
  appName: config.logger.name,
  environment: config.environment,
});

initTracing({
  serviceName: config.logger.name,
  environment: config.environment,
  exporterUrl: config.logger.streams.tempo.url,
});
