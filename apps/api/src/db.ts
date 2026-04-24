import { createDb, type DbClient } from '@repo/db';
import { parseApiEnv } from './config/env.js';

const config = parseApiEnv(process.env);

export const dbClient: DbClient = createDb(config.database);
export const { db, pool } = dbClient;
