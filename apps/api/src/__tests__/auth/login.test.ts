import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import { hashPassword } from '../../lib/password.js';

jest.mock('../../db', () => ({
  db: {
    query: {
      users: { findFirst: jest.fn() },
      userCredentials: { findFirst: jest.fn() },
    },
    insert: jest.fn(),
  },
}));

const { db: mockDb } = jest.requireMock('../../db') as {
  db: {
    query: {
      users: { findFirst: jest.Mock };
      userCredentials: { findFirst: jest.Mock };
    };
    insert: jest.Mock;
  };
};

import { loginRoute } from '../../routes/auth/login.js';

function buildTestApp() {
  const app = Fastify({ logger: false });
  app.register(sensible);
  app.register(loginRoute);
  return app;
}

describe('POST /login', () => {
  let app: ReturnType<typeof buildTestApp>;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildTestApp();
  });

  afterEach(async () => { await app.close(); });

  it('returns 200 with tokens on valid credentials', async () => {
    const hash = await hashPassword('password123');
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-id', email: 'test@test.com' });
    mockDb.query.userCredentials.findFirst.mockResolvedValue({ userId: 'user-id', passwordHash: hash });
    mockDb.insert.mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) });

    const res = await app.inject({
      method: 'POST',
      url: '/login',
      payload: { email: 'test@test.com', password: 'password123' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body.user).toEqual({ id: 'user-id', email: 'test@test.com' });
  });

  it('returns 401 when the user does not exist', async () => {
    mockDb.query.users.findFirst.mockResolvedValue(undefined);
    const res = await app.inject({
      method: 'POST',
      url: '/login',
      payload: { email: 'no@test.com', password: 'password123' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when no local credentials exist (OAuth user)', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-id', email: 'test@test.com' });
    mockDb.query.userCredentials.findFirst.mockResolvedValue(undefined);
    const res = await app.inject({
      method: 'POST',
      url: '/login',
      payload: { email: 'test@test.com', password: 'password123' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when the password is wrong', async () => {
    const hash = await hashPassword('correct');
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-id', email: 'test@test.com' });
    mockDb.query.userCredentials.findFirst.mockResolvedValue({ userId: 'user-id', passwordHash: hash });
    const res = await app.inject({
      method: 'POST',
      url: '/login',
      payload: { email: 'test@test.com', password: 'wrong' },
    });
    expect(res.statusCode).toBe(401);
  });
});
