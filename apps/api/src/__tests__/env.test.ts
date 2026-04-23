import { parseApiEnv } from '../config/env.js';

describe('parseApiEnv', () => {
  const validDb = 'postgresql://u:p@h:5432/d';

  it('parses a complete environment', () => {
    expect(parseApiEnv({ PORT: '4000', DATABASE_URL: validDb })).toEqual({
      port: 4000,
      database: { connectionString: validDb },
    });
  });

  it('defaults PORT to 3002 when unset', () => {
    expect(parseApiEnv({ DATABASE_URL: validDb })).toEqual({
      port: 3002,
      database: { connectionString: validDb },
    });
  });

  it('throws when PORT is not a number', () => {
    expect(() =>
      parseApiEnv({ PORT: 'abc', DATABASE_URL: validDb })
    ).toThrow('PORT must be a positive integer, got: abc');
  });

  it('throws when PORT is zero', () => {
    expect(() =>
      parseApiEnv({ PORT: '0', DATABASE_URL: validDb })
    ).toThrow('PORT must be a positive integer, got: 0');
  });

  it('throws when PORT is negative', () => {
    expect(() =>
      parseApiEnv({ PORT: '-1', DATABASE_URL: validDb })
    ).toThrow('PORT must be a positive integer, got: -1');
  });

  it('throws when PORT is a non-integer number', () => {
    expect(() =>
      parseApiEnv({ PORT: '3.5', DATABASE_URL: validDb })
    ).toThrow('PORT must be a positive integer, got: 3.5');
  });

  it('propagates the DATABASE_URL error', () => {
    expect(() => parseApiEnv({ PORT: '4000' })).toThrow(
      'DATABASE_URL is required'
    );
  });
});
