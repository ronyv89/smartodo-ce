import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import { signAccessToken } from '../../lib/tokens.js';

const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
};

jest.mock('../../db', () => ({ db: {} }));

import { meRoute } from '../../routes/auth/me.js';

function buildTestApp() {
  const app = Fastify({ logger: false });
  app.register(sensible);
  app.register(meRoute);
  return app;
}

function makeBearer() {
  return `Bearer ${signAccessToken({ sub: 'user-1', email: 'a@b.com', sid: 'sess-1' }, jwtConfig)}`;
}

describe('GET /me', () => {
  let app: ReturnType<typeof buildTestApp>;

  beforeEach(() => { app = buildTestApp(); });
  afterEach(async () => { await app.close(); });

  it('returns 200 with user info when authenticated', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/me',
      headers: { authorization: makeBearer() },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ id: 'user-1', email: 'a@b.com' });
  });

  it('returns 401 without a Bearer token', async () => {
    const res = await app.inject({ method: 'GET', url: '/me' });
    expect(res.statusCode).toBe(401);
  });
});
