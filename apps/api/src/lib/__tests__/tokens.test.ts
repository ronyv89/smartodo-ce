import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  parseExpiryMs,
} from '../tokens.js';

const jwtConfig = {
  accessSecret: 'test-access-secret',
  refreshSecret: 'test-refresh-secret',
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
};

describe('parseExpiryMs', () => {
  it('parses seconds', () => expect(parseExpiryMs('30s')).toBe(30_000));
  it('parses minutes', () => expect(parseExpiryMs('15m')).toBe(900_000));
  it('parses hours', () => expect(parseExpiryMs('2h')).toBe(7_200_000));
  it('parses days', () => expect(parseExpiryMs('7d')).toBe(604_800_000));
  it('throws on invalid format', () => {
    expect(() => parseExpiryMs('abc')).toThrow('Invalid expiry: "abc"');
  });
});

describe('signAccessToken / verifyAccessToken', () => {
  it('round-trips successfully', () => {
    const token = signAccessToken(
      { sub: 'user-1', email: 'a@b.com', sid: 'sess-1' },
      jwtConfig,
    );
    const payload = verifyAccessToken(token, jwtConfig.accessSecret);
    expect(payload.sub).toBe('user-1');
    expect(payload.email).toBe('a@b.com');
    expect(payload.sid).toBe('sess-1');
  });

  it('throws when verified with the wrong secret', () => {
    const token = signAccessToken(
      { sub: 'user-1', email: 'a@b.com', sid: 'sess-1' },
      jwtConfig,
    );
    expect(() => verifyAccessToken(token, 'wrong-secret')).toThrow();
  });

  it('throws when the token is expired', () => {
    const token = signAccessToken(
      { sub: 'user-1', email: 'a@b.com', sid: 'sess-1' },
      { ...jwtConfig, accessExpiresIn: '0s' },
    );
    expect(() => verifyAccessToken(token, jwtConfig.accessSecret)).toThrow();
  });
});

describe('signRefreshToken / verifyRefreshToken', () => {
  it('round-trips successfully', () => {
    const token = signRefreshToken({ sub: 'sess-1' }, jwtConfig);
    const payload = verifyRefreshToken(token, jwtConfig.refreshSecret);
    expect(payload.sub).toBe('sess-1');
  });

  it('throws when verified with the wrong secret', () => {
    const token = signRefreshToken({ sub: 'sess-1' }, jwtConfig);
    expect(() => verifyRefreshToken(token, 'wrong-secret')).toThrow();
  });
});
