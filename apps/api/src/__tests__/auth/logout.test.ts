import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import { signAccessToken } from '../../lib/tokens.js';

const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
};

jest.mock('../../db', () => ({
  db: {
    update: jest.fn(),
  },
}));

const { db: mockDb } = jest.requireMock('../../db') as { db: { update: jest.Mock } };

import { logoutRoute } from '../../routes/auth/logout.js';

function buildTestApp() {
  const app = Fastify({ logger: false });
  app.register(sensible);
  app.register(logoutRoute);
  return app;
}

function makeBearer() {
  return `Bearer ${signAccessToken({ sub: 'user-1', email: 'a@b.com', sid: 'sess-1' }, jwtConfig)}`;
}

describe('POST /logout', () => {
  let app: ReturnType<typeof buildTestApp>;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildTestApp();
  });

  afterEach(async () => { await app.close(); });

  it('returns 204 and calls update when authenticated', async () => {
    mockDb.update.mockReturnValue({
      set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
    });

    const res = await app.inject({
      method: 'POST',
      url: '/logout',
      headers: { authorization: makeBearer() },
    });

    expect(res.statusCode).toBe(204);
    expect(mockDb.update).toHaveBeenCalledTimes(1);
  });

  it('returns 401 without a valid Bearer token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/logout',
    });
    expect(res.statusCode).toBe(401);
  });
});
