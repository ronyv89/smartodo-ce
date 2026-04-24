import { parseDbEnv, type DbConfig } from '@repo/db';

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export interface ApiConfig {
  port: number;
  database: DbConfig;
  jwt: JwtConfig;
  corsOrigin: string;
}

export function parseApiEnv(source: NodeJS.ProcessEnv): ApiConfig {
  const rawPort = source.PORT;
  let port = 3002;
  if (rawPort !== undefined) {
    const parsed = Number(rawPort);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`PORT must be a positive integer, got: ${rawPort}`);
    }
    port = parsed;
  }

  const database = parseDbEnv(source);

  const accessSecret = source.JWT_ACCESS_SECRET;
  if (!accessSecret) throw new Error('JWT_ACCESS_SECRET is required');

  const refreshSecret = source.JWT_REFRESH_SECRET;
  if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET is required');

  const jwt: JwtConfig = {
    accessSecret,
    refreshSecret,
    accessExpiresIn: source.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: source.JWT_REFRESH_EXPIRES_IN ?? '7d',
  };

  const corsOrigin = source.CORS_ORIGIN ?? 'http://localhost:3000';

  return { port, database, jwt, corsOrigin };
}
