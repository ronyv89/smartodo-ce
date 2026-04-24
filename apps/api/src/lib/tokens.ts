import jwt from 'jsonwebtoken';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  sid: string;
}

export interface RefreshTokenPayload {
  sub: string;
}

export interface JwtTokenConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export function parseExpiryMs(expiry: string): number {
  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  const match = /^(\d+)([smhd])$/.exec(expiry);
  if (!match) throw new Error(`Invalid expiry: "${expiry}"`);
  const digits = match[1]!;
  const unit = match[2]!;
  return parseInt(digits, 10) * multipliers[unit]!;
}

export function signAccessToken(payload: AccessTokenPayload, config: JwtTokenConfig): string {
  return jwt.sign(payload, config.accessSecret, {
    expiresIn: config.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: RefreshTokenPayload, config: JwtTokenConfig): string {
  return jwt.sign(payload, config.refreshSecret, {
    expiresIn: config.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string, secret: string): AccessTokenPayload {
  return jwt.verify(token, secret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string, secret: string): RefreshTokenPayload {
  return jwt.verify(token, secret) as RefreshTokenPayload;
}
