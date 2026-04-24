import { Pool } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema, type Schema } from './schema.js';

export interface DbConfig {
  connectionString: string;
}

export interface DbClient {
  db: NodePgDatabase<Schema>;
  pool: Pool;
}

export function createDb(config: DbConfig): DbClient {
  const pool = new Pool({ connectionString: config.connectionString });
  const db = drizzle(pool, { schema });
  return { db, pool };
}
