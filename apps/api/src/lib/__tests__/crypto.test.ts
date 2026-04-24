import { sha256Hash } from '../crypto.js';

describe('sha256Hash', () => {
  it('returns a 64-char hex string', () => {
    const result = sha256Hash('hello');
    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[0-9a-f]+$/);
  });

  it('is deterministic for the same input', () => {
    expect(sha256Hash('abc')).toBe(sha256Hash('abc'));
  });

  it('produces different hashes for different inputs', () => {
    expect(sha256Hash('a')).not.toBe(sha256Hash('b'));
  });
});
