import Fastify from 'fastify';
import sensible from '@fastify/sensible';

jest.mock('../../db', () => ({
  db: {
    query: {
      users: { findFirst: jest.fn() },
    },
    insert: jest.fn(),
    transaction: jest.fn(),
  },
}));

const { db: mockDb } = jest.requireMock('../../db') as {
  db: {
    query: { users: { findFirst: jest.Mock } };
    insert: jest.Mock;
    transaction: jest.Mock;
  };
};

import { registerRoute } from '../../routes/auth/register.js';

function buildTestApp() {
  const app = Fastify({ logger: false });
  app.register(sensible);
  app.register(registerRoute);
  return app;
}

describe('POST /register', () => {
  let app: ReturnType<typeof buildTestApp>;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 201 with tokens and user on success', async () => {
    mockDb.query.users.findFirst.mockResolvedValue(undefined);

    mockDb.transaction.mockImplementation(
      async (cb: (tx: { insert: jest.Mock }) => Promise<unknown>) => {
        const txInsert = jest.fn()
          .mockReturnValueOnce({
            values: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([{ id: 'user-id', email: 'test@test.com' }]),
            }),
          })
          .mockReturnValueOnce({
            values: jest.fn().mockResolvedValue(undefined),
          });
        return cb({ insert: txInsert });
      },
    );

    mockDb.insert.mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) });

    const res = await app.inject({
      method: 'POST',
      url: '/register',
      payload: { email: 'test@test.com', password: 'password123' },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body.user).toEqual({ id: 'user-id', email: 'test@test.com' });
  });

  it('returns 409 when the email is already registered', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'existing', email: 'test@test.com' });

    const res = await app.inject({
      method: 'POST',
      url: '/register',
      payload: { email: 'test@test.com', password: 'password123' },
    });

    expect(res.statusCode).toBe(409);
  });

  it('returns 400 when password is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/register',
      payload: { email: 'test@test.com' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/register',
      payload: { email: 'test@test.com', password: '1234567' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('throws when insert returns no rows', async () => {
    mockDb.query.users.findFirst.mockResolvedValue(undefined);

    mockDb.transaction.mockImplementation(
      async (cb: (tx: { insert: jest.Mock }) => Promise<unknown>) => {
        const txInsert = jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        });
        return cb({ insert: txInsert });
      },
    );

    const res = await app.inject({
      method: 'POST',
      url: '/register',
      payload: { email: 'test@test.com', password: 'password123' },
    });

    expect(res.statusCode).toBe(500);
  });
});
