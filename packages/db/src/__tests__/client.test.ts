const poolMock = jest.fn();
const drizzleMock = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation((cfg) => {
    poolMock(cfg);
    return { _tag: 'pool', _cfg: cfg };
  }),
}));

jest.mock('drizzle-orm/node-postgres', () => ({
  drizzle: (...args: unknown[]) => {
    drizzleMock(...args);
    return { _tag: 'db' };
  },
}));

import { createDb } from '../client.js';
import { schema } from '../schema.js';

describe('createDb', () => {
  beforeEach(() => {
    poolMock.mockClear();
    drizzleMock.mockClear();
  });

  it('constructs a Pool with the provided connection string', () => {
    createDb({ connectionString: 'postgresql://x/y' });
    expect(poolMock).toHaveBeenCalledWith({
      connectionString: 'postgresql://x/y',
    });
  });

  it('wraps the pool with drizzle and the package schema', () => {
    const { pool, db } = createDb({ connectionString: 'postgresql://x/y' });
    expect(drizzleMock).toHaveBeenCalledWith(pool, { schema });
    expect(db).toEqual({ _tag: 'db' });
  });

  it('returns the Pool instance alongside the db', () => {
    const { pool } = createDb({ connectionString: 'postgresql://a/b' });
    expect(pool).toEqual({ _tag: 'pool', _cfg: { connectionString: 'postgresql://a/b' } });
  });
});
