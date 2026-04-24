import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import { sha256Hash } from '../../lib/crypto.js';

jest.mock('../../db', () => ({
  db: {
    query: { passwordResetTokens: { findFirst: jest.fn() } },
    update: jest.fn(),
    transaction: jest.fn(),
  },
}));

const { db: mockDb } = jest.requireMock('../../db') as {
  db: {
    query: { passwordResetTokens: { findFirst: jest.Mock } };
    update: jest.Mock;
    transaction: jest.Mock;
  };
};

import { resetPasswordRoute } from '../../routes/auth/reset-password.js';

function buildTestApp() {
  const app = Fastify({ logger: false });
  app.register(sensible);
  app.register(resetPasswordRoute);
  return app;
}

const validToken = 'a'.repeat(64);
const validHash = sha256Hash(validToken);

describe('POST /reset-password', () => {
  let app: ReturnType<typeof buildTestApp>;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildTestApp();
  });

  afterEach(async () => { await app.close(); });

  it('returns 200 on success and calls the transaction', async () => {
    mockDb.query.passwordResetTokens.findFirst.mockResolvedValue({
      id: 'token-id',
      userId: 'user-id',
      tokenHash: validHash,
      expiresAt: new Date(Date.now() + 1_000_000),
      usedAt: null,
    });
    mockDb.transaction.mockImplementation(
      async (cb: (tx: { update: jest.Mock }) => Promise<unknown>) => {
        const txUpdate = jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
        });
        return cb({ update: txUpdate });
      },
    );

    const res = await app.inject({
      method: 'POST',
      url: '/reset-password',
      payload: { token: validToken, password: 'newPassword123' },
    });

    expect(res.statusCode).toBe(200);
    expect(mockDb.transaction).toHaveBeenCalledTimes(1);
  });

  it('returns 400 when the token is not found', async () => {
    mockDb.query.passwordResetTokens.findFirst.mockResolvedValue(undefined);
    const res = await app.inject({
      method: 'POST',
      url: '/reset-password',
      payload: { token: validToken, password: 'newPassword123' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when the token has already been used', async () => {
    mockDb.query.passwordResetTokens.findFirst.mockResolvedValue({
      id: 'token-id',
      userId: 'user-id',
      tokenHash: validHash,
      expiresAt: new Date(Date.now() + 1_000_000),
      usedAt: new Date(),
    });
    const res = await app.inject({
      method: 'POST',
      url: '/reset-password',
      payload: { token: validToken, password: 'newPassword123' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when the token has expired', async () => {
    mockDb.query.passwordResetTokens.findFirst.mockResolvedValue({
      id: 'token-id',
      userId: 'user-id',
      tokenHash: validHash,
      expiresAt: new Date(Date.now() - 1_000),
      usedAt: null,
    });
    const res = await app.inject({
      method: 'POST',
      url: '/reset-password',
      payload: { token: validToken, password: 'newPassword123' },
    });
    expect(res.statusCode).toBe(400);
  });
});
