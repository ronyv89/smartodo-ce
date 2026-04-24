import Fastify from 'fastify';
import sensible from '@fastify/sensible';

jest.mock('../../db', () => ({
  db: {
    query: { users: { findFirst: jest.fn() } },
    insert: jest.fn(),
  },
}));

const { db: mockDb } = jest.requireMock('../../db') as {
  db: {
    query: { users: { findFirst: jest.Mock } };
    insert: jest.Mock;
  };
};

import { forgotPasswordRoute } from '../../routes/auth/forgot-password.js';

function buildTestApp() {
  const app = Fastify({ logger: false });
  app.register(sensible);
  app.register(forgotPasswordRoute);
  return app;
}

describe('POST /forgot-password', () => {
  let app: ReturnType<typeof buildTestApp>;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildTestApp();
  });

  afterEach(async () => { await app.close(); });

  it('returns 200 with a resetToken when the user exists', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({ id: 'user-id', email: 'test@test.com' });
    mockDb.insert.mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) });

    const res = await app.inject({
      method: 'POST',
      url: '/forgot-password',
      payload: { email: 'test@test.com' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('resetToken');
    expect(typeof res.json().resetToken).toBe('string');
  });

  it('returns 200 with null resetToken when the user does not exist', async () => {
    mockDb.query.users.findFirst.mockResolvedValue(undefined);

    const res = await app.inject({
      method: 'POST',
      url: '/forgot-password',
      payload: { email: 'unknown@test.com' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ resetToken: null });
  });

  it('returns 400 when email is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/forgot-password',
      payload: {},
    });
    expect(res.statusCode).toBe(400);
  });
});
