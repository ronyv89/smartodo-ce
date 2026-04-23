import { parseDbEnv } from '../env.js';

describe('parseDbEnv', () => {
  it('returns connectionString when DATABASE_URL is set', () => {
    expect(parseDbEnv({ DATABASE_URL: 'postgresql://u:p@h:5432/d' })).toEqual({
      connectionString: 'postgresql://u:p@h:5432/d',
    });
  });

  it('throws when DATABASE_URL is missing', () => {
    expect(() => parseDbEnv({})).toThrow('DATABASE_URL is required');
  });

  it('throws when DATABASE_URL is an empty string', () => {
    expect(() => parseDbEnv({ DATABASE_URL: '' })).toThrow(
      'DATABASE_URL is required'
    );
  });

  it('throws when DATABASE_URL is whitespace only', () => {
    expect(() => parseDbEnv({ DATABASE_URL: '   ' })).toThrow(
      'DATABASE_URL is required'
    );
  });
});
