import { EventEmitter } from 'events';

import { Request, Response } from 'express';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../config/config.js', () => ({
  config: {
    webhookService: {
      url: 'http://webhook.local',
      apiKey: 'webhook-key',
    },
  },
}));

vi.mock('../../commons/logger.js', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
  },
}));

const { logErrorMock, logInfoMock, logTraceMock } = vi.hoisted(() => ({
  logErrorMock: vi.fn(),
  logInfoMock: vi.fn(),
  logTraceMock: vi.fn(),
}));
vi.mock('../../commons/logger.js', () => ({
  log: {
    info: logInfoMock,
    error: logErrorMock,
    trace: logTraceMock,
  },
}));

import { Matrix } from '../../controllers/matrixController.js';

class FakeAppservice extends EventEmitter {
  botUserId = '@bot:example.org';
  botIntent = { sendText: vi.fn() };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('Matrix controller', () => {
  let appservice: FakeAppservice;
  let fetchMock: any;

  beforeEach(() => {
    appservice = new FakeAppservice();
    Matrix.setupMatrix(appservice as any);
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('room.message event', () => {
    it('ignores messages with no content', async () => {
      appservice.emit('room.message', '!room:example.org', {});
      await flush();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('ignores non-text messages', async () => {
      appservice.emit('room.message', '!room:example.org', {
        content: { msgtype: 'm.image' },
      });
      await flush();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('ignores messages sent by the bot itself', async () => {
      appservice.emit('room.message', '!room:example.org', {
        sender: '@bot:example.org',
        content: { msgtype: 'm.text', body: 'hi' },
      });
      await flush();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('posts a webhook for valid text messages', async () => {
      fetchMock.mockResolvedValue({ ok: true });
      appservice.emit('room.message', '!room:example.org', {
        event_id: '$event1',
        sender: '@user:example.org',
        origin_server_ts: 12345,
        content: { msgtype: 'm.text', body: 'hello world' },
      });
      await flush();

      expect(fetchMock).toHaveBeenCalledWith(
        'http://webhook.local/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'webhook-key',
          }),
        })
      );
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body).toEqual({
        room_id: '!room:example.org',
        event_id: '$event1',
        sender: '@user:example.org',
        body: 'hello world',
        timestamp: 12345,
      });
    });

    it('logs an error when the webhook responds with a non-ok status', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500, text: async () => 'server error' });
      appservice.emit('room.message', '!room:example.org', {
        event_id: '$event2',
        sender: '@user:example.org',
        origin_server_ts: 12345,
        content: { msgtype: 'm.text', body: 'hello' },
      });
      await flush();
      expect(logErrorMock).toHaveBeenCalledWith(
        expect.stringContaining('Webhook error 500'),
        expect.any(Object)
      );
    });

    it('logs an error when fetch throws', async () => {
      fetchMock.mockRejectedValue(new Error('network down'));
      appservice.emit('room.message', '!room:example.org', {
        event_id: '$event3',
        sender: '@user:example.org',
        origin_server_ts: 12345,
        content: { msgtype: 'm.text', body: 'hello' },
      });
      await flush();
      expect(logErrorMock).toHaveBeenCalledWith(
        'Failed to send webhook:',
        expect.objectContaining({ err: expect.any(Error) })
      );
    });
  });

  describe('sendMessage', () => {
    const mockRes = () => {
      const statusMock = vi.fn();
      const jsonMock = vi.fn();
      const res: Partial<Response> = {
        status: statusMock.mockReturnValue({ json: jsonMock }),
        json: jsonMock,
      };
      return { res: res as Response, statusMock, jsonMock };
    };

    it('returns 400 when message is missing', async () => {
      const matrix = new Matrix();
      const req = { body: { roomId: '!room:example.org' } } as Request;
      const { res, statusMock, jsonMock } = mockRes();

      await matrix.sendMessage(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'message and channelId are required' });
    });

    it('returns 400 when roomId is missing', async () => {
      const matrix = new Matrix();
      const req = { body: { message: 'hi' } } as Request;
      const { res, statusMock, jsonMock } = mockRes();

      await matrix.sendMessage(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'message and channelId are required' });
    });

    it('sends the message successfully', async () => {
      const matrix = new Matrix();
      const req = { body: { message: 'hi', roomId: '!room:example.org' } } as Request;
      const { res, statusMock, jsonMock } = mockRes();

      await matrix.sendMessage(req, res);
      expect(appservice.botIntent.sendText).toHaveBeenCalledWith('!room:example.org', 'hi');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ ok: true });
    });

    it('returns 500 when sendText throws', async () => {
      appservice.botIntent.sendText.mockRejectedValueOnce(new Error('boom'));
      const matrix = new Matrix();
      const req = { body: { message: 'hi', roomId: '!room:example.org' } } as Request;
      const { res, statusMock, jsonMock } = mockRes();

      await matrix.sendMessage(req, res);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to send message' });
    });
  });
});
