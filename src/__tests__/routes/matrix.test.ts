import express from 'express';
import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';

const { sendMessageMock } = vi.hoisted(() => ({
  sendMessageMock: vi.fn((req: any, res: any) => res.status(200).json({ ok: true })),
}));

vi.mock('../../controllers/matrixController.js', () => ({
  Matrix: class {
    sendMessage = sendMessageMock;
  },
}));

import matrixRouter from '../../routes/matrix.js';

const app = express();
app.use(express.json());
app.use('/matrix', matrixRouter);

describe('matrix router', () => {
  it('routes POST /matrix/message to Matrix.sendMessage', async () => {
    const res = await request(app).post('/matrix/message').send({ message: 'hi', roomId: '!x:y' });
    expect(res.status).toBe(200);
    expect(sendMessageMock).toHaveBeenCalled();
  });
});
