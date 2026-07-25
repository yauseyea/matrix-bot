import { Logger } from '@yauseyea/node-observability/logger';

import { config } from '../config/config.js';

export const log = Logger.fromConfig({
  name: config.logger.name,
  environment: config.environment,
  streams: {
    console: {
      level: config.logger.streams.console.level,
      prettyPrint: config.logger.streams.console.prettyPrint,
    },
    loki: { level: config.logger.streams.loki.level, url: config.logger.streams.loki.url },
  },
});
