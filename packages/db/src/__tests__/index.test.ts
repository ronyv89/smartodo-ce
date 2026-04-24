import * as pkg from '../index.js';

describe('@repo/db public API', () => {
  it('exports schema', () => {
    expect(pkg.schema).toEqual({});
  });

  it('exports createDb', () => {
    expect(typeof pkg.createDb).toBe('function');
  });

  it('exports runMigrations', () => {
    expect(typeof pkg.runMigrations).toBe('function');
  });

  it('exports parseDbEnv', () => {
    expect(typeof pkg.parseDbEnv).toBe('function');
  });
});
