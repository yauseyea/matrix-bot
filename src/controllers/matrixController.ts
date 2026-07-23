import { Appservice } from '@vector-im/matrix-bot-sdk';
import { Logger } from '../commons/logger.js';
import { config } from '../config/config.js';

export class Matrix {
  static setupMatrix(appservice: Appservice): void {
    const log = Logger.fromConfig(config.logger);

    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    appservice.on('room.message', async (roomId: string, event: any) => {
      if (!event['content'] || event['content']['msgtype'] !== 'm.text') return;
      if (event['sender'] === appservice.botUserId) return;

      const payload = {
        room_id: roomId,
        event_id: event['event_id'],
        sender: event['sender'],
        body: event['content']['body'],
        timestamp: event['origin_server_ts'],
      };
      try {
        const res = await fetch(`${config.webhookService.url}/webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.webhookService.apiKey,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          log.error(`Webhook error ${res.status}: ${await res.text()}`, { res });
        }
      } catch (err) {
        log.error('Failed to send webhook:', { err });
      }
    });
  }
}
