import Pyroscope from '@pyroscope/nodejs';

import { config } from '../config/config.js';

Pyroscope.init({
  serverAddress: config.logger.streams.profiling.url,
  appName: config.logger.name,
  tags: {
    env: config.environment,
  },
  wall: {
    collectCpuTime: true, // enables CPU profiling on top of wall time
  },
});

Pyroscope.start();

const shutdown = () => {
  Pyroscope.stop()
    .then(() => {})
    .catch(() => {});
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
