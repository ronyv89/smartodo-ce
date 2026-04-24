import { schema, users, userCredentials, userIdentities, sessions, passwordResetTokens } from '../schema.js';

describe('schema', () => {
  it('is an object', () => {
    expect(typeof schema).toBe('object');
  });

  it('has exactly 5 tables', () => {
    expect(Object.keys(schema)).toHaveLength(5);
  });

  it('exports users table', () => {
    expect(schema.users).toBe(users);
  });

  it('exports userCredentials table', () => {
    expect(schema.userCredentials).toBe(userCredentials);
  });

  it('exports userIdentities table', () => {
    expect(schema.userIdentities).toBe(userIdentities);
  });

  it('exports sessions table', () => {
    expect(schema.sessions).toBe(sessions);
  });

  it('exports passwordResetTokens table', () => {
    expect(schema.passwordResetTokens).toBe(passwordResetTokens);
  });
});
