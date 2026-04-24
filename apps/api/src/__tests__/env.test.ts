import { parseApiEnv } from '../config/env.js';

describe('parseApiEnv', () => {
  const validDb = 'postgresql://u:p@h:5432/d';
  const jwtEnv = {
    JWT_ACCESS_SECRET: 'access-secret',
    JWT_REFRESH_SECRET: 'refresh-secret',
  };

  it('parses a complete environment', () => {
    expect(parseApiEnv({ PORT: '4000', DATABASE_URL: validDb, ...jwtEnv })).toMatchObject({
      port: 4000,
      database: { connectionString: validDb },
    });
  });

  it('defaults PORT to 3002 when unset', () => {
    expect(parseApiEnv({ DATABASE_URL: validDb, ...jwtEnv })).toMatchObject({
      port: 3002,
      database: { connectionString: validDb },
    });
  });

  it('throws when PORT is not a number', () => {
    expect(() =>
      parseApiEnv({ PORT: 'abc', DATABASE_URL: validDb, ...jwtEnv })
    ).toThrow('PORT must be a positive integer, got: abc');
  });

  it('throws when PORT is zero', () => {
    expect(() =>
      parseApiEnv({ PORT: '0', DATABASE_URL: validDb, ...jwtEnv })
    ).toThrow('PORT must be a positive integer, got: 0');
  });

  it('throws when PORT is negative', () => {
    expect(() =>
      parseApiEnv({ PORT: '-1', DATABASE_URL: validDb, ...jwtEnv })
    ).toThrow('PORT must be a positive integer, got: -1');
  });

  it('throws when PORT is a non-integer number', () => {
    expect(() =>
      parseApiEnv({ PORT: '3.5', DATABASE_URL: validDb, ...jwtEnv })
    ).toThrow('PORT must be a positive integer, got: 3.5');
  });

  it('propagates the DATABASE_URL error', () => {
    expect(() => parseApiEnv({ PORT: '4000', ...jwtEnv })).toThrow(
      'DATABASE_URL is required'
    );
  });

  // JWT + CORS
  it('parses JWT and CORS when all values provided', () => {
    const result = parseApiEnv({
      DATABASE_URL: validDb,
      ...jwtEnv,
      JWT_ACCESS_EXPIRES_IN: '30m',
      JWT_REFRESH_EXPIRES_IN: '14d',
      CORS_ORIGIN: 'https://example.com',
    });
    expect(result.jwt).toEqual({
      accessSecret: 'access-secret',
      refreshSecret: 'refresh-secret',
      accessExpiresIn: '30m',
      refreshExpiresIn: '14d',
    });
    expect(result.corsOrigin).toBe('https://example.com');
  });

  it('defaults JWT_ACCESS_EXPIRES_IN to 15m', () => {
    expect(parseApiEnv({ DATABASE_URL: validDb, ...jwtEnv }).jwt.accessExpiresIn).toBe('15m');
  });

  it('defaults JWT_REFRESH_EXPIRES_IN to 7d', () => {
    expect(parseApiEnv({ DATABASE_URL: validDb, ...jwtEnv }).jwt.refreshExpiresIn).toBe('7d');
  });

  it('defaults CORS_ORIGIN to http://localhost:3000', () => {
    expect(parseApiEnv({ DATABASE_URL: validDb, ...jwtEnv }).corsOrigin).toBe('http://localhost:3000');
  });

  it('throws when JWT_ACCESS_SECRET is missing', () => {
    expect(() =>
      parseApiEnv({ DATABASE_URL: validDb, JWT_REFRESH_SECRET: 'r' }),
    ).toThrow('JWT_ACCESS_SECRET is required');
  });

  it('throws when JWT_REFRESH_SECRET is missing', () => {
    expect(() =>
      parseApiEnv({ DATABASE_URL: validDb, JWT_ACCESS_SECRET: 'a' }),
    ).toThrow('JWT_REFRESH_SECRET is required');
  });
});
