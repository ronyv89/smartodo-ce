const createDbMock = jest.fn();

jest.mock('@repo/db', () => {
  const actual = jest.requireActual('@repo/db');
  return {
    ...actual,
    createDb: (...args: unknown[]) => {
      createDbMock(...args);
      return { db: { _tag: 'db' }, pool: { _tag: 'pool' } };
    },
  };
});

describe('apps/api db singleton', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    createDbMock.mockClear();
    process.env = {
      ...ORIGINAL_ENV,
      PORT: '3002',
      DATABASE_URL: 'postgresql://u:p@h:5432/d',
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('calls createDb with the parsed database config', async () => {
    await import('../db.js');
    expect(createDbMock).toHaveBeenCalledWith({
      connectionString: 'postgresql://u:p@h:5432/d',
    });
  });

  it('exports db and pool from the created client', async () => {
    const mod = await import('../db.js');
    expect(mod.db).toEqual({ _tag: 'db' });
    expect(mod.pool).toEqual({ _tag: 'pool' });
  });

  it('exports the full dbClient object', async () => {
    const mod = await import('../db.js');
    expect(mod.dbClient).toEqual({
      db: { _tag: 'db' },
      pool: { _tag: 'pool' },
    });
  });
});
