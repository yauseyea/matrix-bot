import { createRequire } from 'module';

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
const require = createRequire(import.meta.url);
const { version } = require('../../package.json') as { version: string };

import { config } from '../config/config.js';

const { url } = config.logger.streams.tempo;

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: config.logger.name,
    [ATTR_SERVICE_VERSION]: version,
    environment: config.environment,
  }),
  traceExporter: new OTLPTraceExporter({ url }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

const shutdown = () => {
  sdk
    .shutdown()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { sdk };
