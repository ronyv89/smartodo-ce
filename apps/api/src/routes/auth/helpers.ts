// apps/api/src/routes/auth/helpers.ts
import { randomUUID } from 'node:crypto';
import { sessions } from '@repo/db';
import { db } from '../../db.js';
import { parseExpiryMs, signAccessToken, signRefreshToken } from '../../lib/tokens.js';
import { sha256Hash } from '../../lib/crypto.js';
import type { JwtConfig } from '../../config/env.js';

export async function issueTokenPair(
  userId: string,
  email: string,
  jwtConfig: JwtConfig,
): Promise<{ accessToken: string; refreshToken: string }> {
  const sessionId = randomUUID();
  const refreshToken = signRefreshToken({ sub: sessionId }, jwtConfig);
  const refreshTokenHash = sha256Hash(refreshToken);
  const expiresAt = new Date(Date.now() + parseExpiryMs(jwtConfig.refreshExpiresIn));

  await db.insert(sessions).values({ id: sessionId, userId, refreshTokenHash, expiresAt });

  const accessToken = signAccessToken({ sub: userId, email, sid: sessionId }, jwtConfig);
  return { accessToken, refreshToken };
}
