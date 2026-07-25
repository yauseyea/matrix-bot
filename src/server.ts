import { Appservice, SimpleFsStorageProvider } from '@vector-im/matrix-bot-sdk';
import express from 'express';

import { log } from './commons/logger.js';
import { config, environment } from './config/config.js';
import { Matrix } from './controllers/matrixController.js';
import router from './routes/routes.js';

const { port } = config.app;

const storage = new SimpleFsStorageProvider(`${config.matrix.configPath}`);

const appservice = new Appservice({
  homeserverName: config.matrix.name,
  homeserverUrl: config.matrix.url,
  port,
  bindAddress: '0.0.0.0',
  registration: {
    url: config.matrix.url,
    as_token: config.matrix.asToken,
    hs_token: config.matrix.hsToken,
    sender_localpart: config.matrix.botLocalPart,
    namespaces: {
      users: [
        {
          regex: `^@${config.matrix.botLocalPart}:${config.matrix.name}$`,
          exclusive: true,
        },
      ],
      rooms: [],
      aliases: [],
    },
  },
  storage,
});

const startWithRetry = async (maxRetries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await appservice.begin();
      log.info(`Loading config for environment: ${environment}`, { port, environment });
      log.info(`Appservice listening on port ${port}`);
      return;
    } catch (err) {
      log.error(`Appservice start attempt ${attempt}/${maxRetries} failed`, {
        error: err instanceof Error ? err.message : String(err),
      });
      if (attempt === maxRetries) {
        log.error('Appservice failed to start after max retries, exiting');
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

const startApp = () => {
  const app = appservice.expressAppInstance as unknown as express.Application;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    const logMsg = `${new Date().toISOString()} - ${req.method} ${req.path}`;
    const context = {
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query,
      params: req.params,
    };
    if (req.path !== '/metrics' && req.path !== '/health') {
      log.info(logMsg, context);
    } else {
      log.trace(logMsg, context);
    }
    next();
  });

  app.use('/', router);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
    log.info(`${req.method} ${req.path} - 404 - Not found`);
  });

  // Error handler
  // oxlint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    log.error(`${req.method} ${req.path} - 500 - ${err.message}`, { error: err });
    res.status(500).json({ error: 'An unexpected error has occurred in the backend' });
  });

  appservice.on('room.invite', async (roomId: string) => {
    await appservice.botClient.joinRoom(roomId);
  });

  Matrix.setupMatrix(appservice);

  startWithRetry().catch((err) => {
    log.error('Fatal error during startup', {
      error: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
  });
};

try {
  startApp();
} catch (error) {
  log.error(`App crashed with unexpected error!`, { error });
}
