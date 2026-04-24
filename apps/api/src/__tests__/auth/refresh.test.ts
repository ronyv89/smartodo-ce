import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import { signRefreshToken } from '../../lib/tokens.js';
import { sha256Hash } from '../../lib/crypto.js';

const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
};

jest.mock('../../db', () => ({
  db: {
    query: {
      sessions: { findFirst: jest.fn() },
      users: { findFirst: jest.fn() },
    },
    insert: jest.fn(),
    update: jest.fn(),
    transaction: jest.fn(),
  },
}));

const { db: mockDb } = jest.requireMock('../../db') as {
  db: {
    query: {
      sessions: { findFirst: jest.Mock };
      users: { findFirst: jest.Mock };
    };
    insert: jest.Mock;
    update: jest.Mock;
    transaction: jest.Mock;
  };
};

import { refreshRoute } from '../../routes/auth/refresh.js';

function buildTestApp() {
  const app = Fastify({ logger: false });
  app.register(sensible);
  app.register(refreshRoute);
  return app;
}

describe('POST /refresh', () => {
  let app: ReturnType<typeof buildTestApp>;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildTestApp();
  });

  afterEach(async () => { await app.close(); });

  it('returns 200 with a new token pair on valid refresh token', async () => {
    const sessionId = 'sess-abc';
    const rawRefresh = signRefreshToken({ sub: sessionId }, jwtConfig);
    const hash = sha256Hash(rawRefresh);

    mockDb.query.sessions.findFirst.mockResolvedValue({
      id: sessionId,
      userId: 'user-id',
      refreshTokenHash: hash,
      expiresAt: new Date(Date.now() + 1_000_000),
      revokedAt: null,
    });
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-id', email: 'user@test.com' });

    mockDb.transaction.mockImplementation(
      async (cb: (tx: { update: jest.Mock }) => Promise<unknown>) => {
        const txUpdate = jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
        });
        return cb({ update: txUpdate });
      },
    );
    mockDb.insert.mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) });

    const res = await app.inject({
      method: 'POST',
      url: '/refresh',
      payload: { refreshToken: rawRefresh },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
  });

  it('returns 401 when the refresh token JWT is invalid', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/refresh',
      payload: { refreshToken: 'not-a-jwt' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when the session is not found', async () => {
    const rawRefresh = signRefreshToken({ sub: 'sess-missing' }, jwtConfig);
    mockDb.query.sessions.findFirst.mockResolvedValue(undefined);
    const res = await app.inject({
      method: 'POST',
      url: '/refresh',
      payload: { refreshToken: rawRefresh },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when the session is revoked', async () => {
    const sessionId = 'sess-revoked';
    const rawRefresh = signRefreshToken({ sub: sessionId }, jwtConfig);
    const hash = sha256Hash(rawRefresh);
    mockDb.query.sessions.findFirst.mockResolvedValue({
      id: sessionId,
      userId: 'user-id',
      refreshTokenHash: hash,
      expiresAt: new Date(Date.now() + 1_000_000),
      revokedAt: new Date(),
    });
    const res = await app.inject({
      method: 'POST',
      url: '/refresh',
      payload: { refreshToken: rawRefresh },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when the session is expired', async () => {
    const sessionId = 'sess-exp';
    const rawRefresh = signRefreshToken({ sub: sessionId }, jwtConfig);
    const hash = sha256Hash(rawRefresh);
    mockDb.query.sessions.findFirst.mockResolvedValue({
      id: sessionId,
      userId: 'user-id',
      refreshTokenHash: hash,
      expiresAt: new Date(Date.now() - 1_000),
      revokedAt: null,
    });
    const res = await app.inject({
      method: 'POST',
      url: '/refresh',
      payload: { refreshToken: rawRefresh },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when the session is valid but user no longer exists', async () => {
    const sessionId = 'sess-orphan';
    const rawRefresh = signRefreshToken({ sub: sessionId }, jwtConfig);
    const hash = sha256Hash(rawRefresh);
    mockDb.query.sessions.findFirst.mockResolvedValue({
      id: sessionId,
      userId: 'deleted-user-id',
      refreshTokenHash: hash,
      expiresAt: new Date(Date.now() + 1_000_000),
      revokedAt: null,
    });
    mockDb.query.users.findFirst.mockResolvedValue(undefined);
    const res = await app.inject({
      method: 'POST',
      url: '/refresh',
      payload: { refreshToken: rawRefresh },
    });
    expect(res.statusCode).toBe(401);
  });
});
