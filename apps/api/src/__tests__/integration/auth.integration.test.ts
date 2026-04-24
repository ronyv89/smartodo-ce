import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { buildApp } from '../../app.js';
import { createDb } from '@repo/db';
import type { ApiConfig } from '../../config/env.js';

const RUN = process.env.INTEGRATION_TEST === 'true';
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? '';

const testConfig: ApiConfig = {
  port: 3002,
  database: { connectionString: TEST_DATABASE_URL },
  jwt: {
    accessSecret: 'integration-test-access-secret-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    refreshSecret: 'integration-test-refresh-secret-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  corsOrigin: 'http://localhost:3000',
};

(RUN ? describe : describe.skip)('Auth integration', () => {
  jest.setTimeout(30_000);

  const app = buildApp(testConfig);
  const { db } = createDb(testConfig.database);

  beforeAll(async () => {
    if (!TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL is required for integration tests');
  });

  beforeEach(async () => {
    await db.execute(
      sql`TRUNCATE TABLE password_reset_tokens, sessions, user_credentials, user_identities, users RESTART IDENTITY CASCADE`,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('register → login → refresh → me → logout lifecycle', () => {
    it('completes the full auth lifecycle', async () => {
      const registerRes = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { email: 'lifecycle@test.com', password: 'password123' },
      });
      expect(registerRes.statusCode).toBe(201);
      const { accessToken, refreshToken, user } = registerRes.json();
      expect(user.email).toBe('lifecycle@test.com');

      const meRes = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: `Bearer ${accessToken}` },
      });
      expect(meRes.statusCode).toBe(200);
      expect(meRes.json()).toMatchObject({ email: 'lifecycle@test.com' });

      const loginRes = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'lifecycle@test.com', password: 'password123' },
      });
      expect(loginRes.statusCode).toBe(200);

      const refreshRes = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken },
      });
      expect(refreshRes.statusCode).toBe(200);
      const { accessToken: newAccess, refreshToken: newRefresh } = refreshRes.json();

      const oldRefreshRes = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken },
      });
      expect(oldRefreshRes.statusCode).toBe(401);

      const meRes2 = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: `Bearer ${newAccess}` },
      });
      expect(meRes2.statusCode).toBe(200);

      const logoutRes = await app.inject({
        method: 'POST',
        url: '/auth/logout',
        headers: { authorization: `Bearer ${newAccess}` },
      });
      expect(logoutRes.statusCode).toBe(204);

      const afterLogoutRefresh = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken: newRefresh },
      });
      expect(afterLogoutRefresh.statusCode).toBe(401);
    });
  });

  it('returns 409 when registering with a duplicate email', async () => {
    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'dup@test.com', password: 'password123' },
    });
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'dup@test.com', password: 'different123' },
    });
    expect(res.statusCode).toBe(409);
  });

  it('returns 401 for wrong password', async () => {
    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'wrongpw@test.com', password: 'correctPass1' },
    });
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'wrongpw@test.com', password: 'wrongPass1' },
    });
    expect(res.statusCode).toBe(401);
  });

  describe('forgot-password → reset-password', () => {
    it('updates the password and allows login with the new password', async () => {
      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { email: 'reset@test.com', password: 'oldPassword1' },
      });

      const forgotRes = await app.inject({
        method: 'POST',
        url: '/auth/forgot-password',
        payload: { email: 'reset@test.com' },
      });
      expect(forgotRes.statusCode).toBe(200);
      const { resetToken } = forgotRes.json();

      const resetRes = await app.inject({
        method: 'POST',
        url: '/auth/reset-password',
        payload: { token: resetToken, password: 'newPassword1' },
      });
      expect(resetRes.statusCode).toBe(200);

      const loginNew = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'reset@test.com', password: 'newPassword1' },
      });
      expect(loginNew.statusCode).toBe(200);

      const loginOld = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'reset@test.com', password: 'oldPassword1' },
      });
      expect(loginOld.statusCode).toBe(401);
    });

    it('returns 400 when the reset token is used twice', async () => {
      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { email: 'once@test.com', password: 'password123' },
      });

      const { resetToken } = (
        await app.inject({
          method: 'POST',
          url: '/auth/forgot-password',
          payload: { email: 'once@test.com' },
        })
      ).json();

      await app.inject({
        method: 'POST',
        url: '/auth/reset-password',
        payload: { token: resetToken, password: 'newPassword1' },
      });

      const secondReset = await app.inject({
        method: 'POST',
        url: '/auth/reset-password',
        payload: { token: resetToken, password: 'anotherNew1' },
      });
      expect(secondReset.statusCode).toBe(400);
    });

    it('returns 200 with null resetToken for unknown email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/forgot-password',
        payload: { email: 'unknown@test.com' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ resetToken: null });
    });
  });
});
