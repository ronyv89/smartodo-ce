import { hashPassword, verifyPassword } from '../password.js';

describe('hashPassword', () => {
  it('returns a non-empty bcrypt hash string', async () => {
    const hash = await hashPassword('secret123');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it('produces a different hash each call (random salt)', async () => {
    const h1 = await hashPassword('secret123');
    const h2 = await hashPassword('secret123');
    expect(h1).not.toBe(h2);
  });
});

describe('verifyPassword', () => {
  it('returns true for the correct password', async () => {
    const hash = await hashPassword('correct');
    expect(await verifyPassword('correct', hash)).toBe(true);
  });

  it('returns false for the wrong password', async () => {
    const hash = await hashPassword('correct');
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});
