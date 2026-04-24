import type { FastifyRequest, FastifyReply } from 'fastify';
import { signAccessToken } from '../lib/tokens.js';
import { authenticate } from '../plugins/authenticate.js';

const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
};

function makeReq(authorization?: string): FastifyRequest {
  return {
    headers: { authorization },
    user: undefined,
  } as unknown as FastifyRequest;
}

function makeReply() {
  const reply = {
    _status: 0,
    _body: undefined as unknown,
    code(n: number) {
      this._status = n;
      return this;
    },
    send(body: unknown) {
      this._body = body;
    },
  };
  return reply;
}

describe('authenticate', () => {
  it('sets req.user when given a valid Bearer token', async () => {
    const token = signAccessToken(
      { sub: 'user-1', email: 'a@b.com', sid: 'sess-1' },
      jwtConfig,
    );
    const req = makeReq(`Bearer ${token}`);
    const reply = makeReply();

    await authenticate(req as FastifyRequest, reply as unknown as FastifyReply);

    expect(req.user).toEqual({ id: 'user-1', email: 'a@b.com', sessionId: 'sess-1' });
    expect(reply._status).toBe(0);
  });

  it('replies 401 when Authorization header is missing', async () => {
    const req = makeReq(undefined);
    const reply = makeReply();
    await authenticate(req as FastifyRequest, reply as unknown as FastifyReply);
    expect(reply._status).toBe(401);
  });

  it('replies 401 when Authorization header is not Bearer', async () => {
    const req = makeReq('Basic abc123');
    const reply = makeReply();
    await authenticate(req as FastifyRequest, reply as unknown as FastifyReply);
    expect(reply._status).toBe(401);
  });

  it('replies 401 when the token is invalid', async () => {
    const req = makeReq('Bearer not-a-jwt');
    const reply = makeReply();
    await authenticate(req as FastifyRequest, reply as unknown as FastifyReply);
    expect(reply._status).toBe(401);
  });

  it('replies 401 when the token uses the wrong secret', async () => {
    const token = signAccessToken(
      { sub: 'user-1', email: 'a@b.com', sid: 'sess-1' },
      { ...jwtConfig, accessSecret: 'wrong-secret' },
    );
    const req = makeReq(`Bearer ${token}`);
    const reply = makeReply();
    await authenticate(req as FastifyRequest, reply as unknown as FastifyReply);
    expect(reply._status).toBe(401);
  });
});
