import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDbEnv } from '../env.js';
import { createDb } from '../client.js';
import { runMigrations } from '../migrate.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(here, '../../migrations');

async function main(): Promise<void> {
  const config = parseDbEnv(process.env);
  const { db, pool } = createDb(config);
  try {
    await runMigrations(db, migrationsFolder);
    console.log('Migrations complete');
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
