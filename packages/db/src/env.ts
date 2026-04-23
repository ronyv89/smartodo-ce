export interface DbConfig {
  connectionString: string;
}

export function parseDbEnv(source: NodeJS.ProcessEnv): DbConfig {
  const value = source.DATABASE_URL;
  if (value === undefined || value.trim() === '') {
    throw new Error('DATABASE_URL is required');
  }
  return { connectionString: value };
}
