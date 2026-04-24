jest.mock('@repo/db', () => {
  const actual = jest.requireActual('@repo/db');
  return {
    ...actual,
    createDb: () => ({
      db: {
        query: {
          users: { findFirst: jest.fn() },
          userCredentials: { findFirst: jest.fn() },
          sessions: { findFirst: jest.fn() },
          passwordResetTokens: { findFirst: jest.fn() },
        },
        insert: jest.fn(),
        update: jest.fn(),
        transaction: jest.fn(),
      },
      pool: { end: jest.fn() },
    }),
  };
});

import { buildApp } from '../app.js';

describe('Health route (with explicit config)', () => {
  const app = buildApp({
    port: 3002,
    database: { connectionString: 'postgresql://mock:mock@localhost:5432/mock' },
    jwt: {
      accessSecret: 'test-access-secret',
      refreshSecret: 'test-refresh-secret',
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
    },
    corsOrigin: 'http://localhost:3000',
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 with status ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});

describe('Health route (default config from process.env)', () => {
  const app = buildApp();

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 when config is read from process.env', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});
