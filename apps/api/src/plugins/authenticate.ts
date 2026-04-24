import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../lib/tokens.js';

export interface AuthUser {
  id: string;
  email: string;
  sessionId: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // JWT_ACCESS_SECRET is validated at startup in buildApp() via parseApiEnv
  const accessSecret = process.env.JWT_ACCESS_SECRET!;
  const auth = request.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
  const token = auth.slice(7);
  try {
    const payload = verifyAccessToken(token, accessSecret);
    request.user = { id: payload.sub, email: payload.email, sessionId: payload.sid };
  } catch {
    reply.code(401).send({ error: 'Unauthorized' });
  }
}
