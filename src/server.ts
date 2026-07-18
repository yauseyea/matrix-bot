import './commons/profiling.js';
import './commons/tracing.js';
import express from 'express';
import { Appservice, SimpleFsStorageProvider } from '@vector-im/matrix-bot-sdk';

import { Logger } from './commons/logger.js';
import { config, environment } from './config/config.js';
import router from './routes/routes.js';
import { Matrix } from './controllers/matrixController.js';

const log = Logger.fromConfig(config.logger);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    log.error(`${req.method} ${req.path} - 500 - ${err.message}`, { error: err });
    res.status(500).json({ error: 'An unexpected error has occurred in the backend' });
  });

  appservice.on('room.invite', async (roomId: string) => {
    await appservice.botClient.joinRoom(roomId);
  });

  Matrix.setupMatrix(appservice);

  appservice.begin().then(() => {
    log.info(`Loading config for environment: ${environment}`, { port, environment });
    log.info(`Appservice listening on port ${port}`);
  });
};

try {
  startApp();
} catch (error) {
  log.error(`App crashed with unexpected error!`, { error });
}
