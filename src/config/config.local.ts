import type { AppConfig } from './config.interface.js';

import { requireEnvVar, splittStringIntoArray } from './config.interface.js';

export const localConfig: AppConfig = {
  environment: 'local',
  logger: {
    name: 'matrix-bot',
    environment: 'local',
    streams: {
      console: {
        level: 'trace',
        prettyPrint: true,
      },
      loki: {
        level: 'debug',
        url: process.env.LOKI_URL || 'http://admin.docker.internal:3500',
      },
      tempo: {
        url: process.env.TEMPO_URL || 'http://admin.docker.internal:3510/v1/traces',
      },
      profiling: {
        url: process.env.PROFILING_URL || 'http://admin.docker.internal:4040',
      },
    },
  },
  app: {
    port: parseInt(process.env.PORT || '9000'),
  },
  matrix: {
    url: requireEnvVar('HOMESERVER_URL'),
    name: requireEnvVar('HOMESERVER_NAME'),
    asToken: requireEnvVar('AS_TOKEN'),
    hsToken: requireEnvVar('HS_TOKEN'),
    botLocalPart: 'webhookbot-local',
    configPath: './bot-storage.json',
  },
  webhookService: {
    url: requireEnvVar('WEBHOOK_URL'),
    apiKey: requireEnvVar('WEBHOOK_API_KEY'),
  },
  auth: {
    apiKeys: splittStringIntoArray(requireEnvVar('AUTH_API_KEY'), ','),
  },
};
