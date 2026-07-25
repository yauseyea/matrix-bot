import { Appservice } from '@vector-im/matrix-bot-sdk';
import { Request, Response } from 'express';

import { log } from '../commons/logger.js';
import { config } from '../config/config.js';

export class Matrix {
  private static appservice: Appservice;
  static setupMatrix(appservice: Appservice): void {
    Matrix.appservice = appservice;
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

  sendMessage = async (req: Request, res: Response): Promise<void> => {
    const { message, roomId } = req.body;

    if (!message || !roomId) {
      res.status(400).json({ error: 'message and channelId are required' });
      return;
    }

    try {
      await Matrix.appservice.botIntent.sendText(roomId, message);
      res.status(200).json({ ok: true });
    } catch (err) {
      log.error('Failed to send matrix message:', { err });
      res.status(500).json({ error: 'Failed to send message' });
    }
  };
}
