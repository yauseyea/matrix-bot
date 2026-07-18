import { Appservice } from '@vector-im/matrix-bot-sdk';
import { Logger } from '../commons/logger.js';
import { config } from '../config/config.js';

export class Matrix {
  static setupMatrix(appservice: Appservice): void {
    const log = Logger.fromConfig(config.logger);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appservice.on('room.message', async (roomId: string, event: any) => {
      if (!event['content'] || event['content']['msgtype'] !== 'm.text') return;
      if (event['sender'] === appservice.botUserId) return;

      try {
        const res = await fetch('https://push.yauseyenka.de/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
            Title: `Message from ${event['sender']}`,
          },
          body: event['content']['body'],
        });
        if (!res.ok) {
          log.error(`ntfy error ${res.status}: ${await res.text()}`);
        }
      } catch (err) {
        log.error('Failed to send to ntfy', { error: err });
      }
    });
  }
}
