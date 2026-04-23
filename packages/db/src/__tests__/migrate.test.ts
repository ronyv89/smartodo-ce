const migrateFn = jest.fn();

jest.mock('drizzle-orm/node-postgres/migrator', () => ({
  migrate: (...args: unknown[]) => migrateFn(...args),
}));

import { runMigrations } from '../migrate.js';

describe('runMigrations', () => {
  beforeEach(() => {
    migrateFn.mockReset();
    migrateFn.mockResolvedValue(undefined);
  });

  it('invokes the drizzle migrator with db and migrationsFolder', async () => {
    const db = { _tag: 'db' } as never;
    await runMigrations(db, './migrations');
    expect(migrateFn).toHaveBeenCalledWith(db, { migrationsFolder: './migrations' });
  });

  it('resolves when the migrator resolves', async () => {
    const db = { _tag: 'db' } as never;
    await expect(runMigrations(db, './migrations')).resolves.toBeUndefined();
  });

  it('rejects when the migrator throws', async () => {
    migrateFn.mockRejectedValueOnce(new Error('boom'));
    const db = { _tag: 'db' } as never;
    await expect(runMigrations(db, './migrations')).rejects.toThrow('boom');
  });
});
