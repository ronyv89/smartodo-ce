import * as pkg from '../index.js';

describe('@repo/db public API', () => {
  it('exports schema with 5 tables', () => {
    expect(typeof pkg.schema).toBe('object');
    expect(Object.keys(pkg.schema)).toHaveLength(5);
  });

  it('exports users table', () => {
    expect(pkg.users).toBeDefined();
  });

  it('exports userCredentials table', () => {
    expect(pkg.userCredentials).toBeDefined();
  });

  it('exports userIdentities table', () => {
    expect(pkg.userIdentities).toBeDefined();
  });

  it('exports sessions table', () => {
    expect(pkg.sessions).toBeDefined();
  });

  it('exports passwordResetTokens table', () => {
    expect(pkg.passwordResetTokens).toBeDefined();
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
