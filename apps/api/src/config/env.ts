import { parseDbEnv, type DbConfig } from '@repo/db';

export interface ApiConfig {
  port: number;
  database: DbConfig;
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
  return { port, database };
}
