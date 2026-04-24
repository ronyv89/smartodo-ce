import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { sessions, users } from '@repo/db';
import { db } from '../../db.js';
import { verifyRefreshToken } from '../../lib/tokens.js';
import { parseApiEnv } from '../../config/env.js';
import { issueTokenPair } from './helpers.js';

export async function refreshRoute(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: { refreshToken: string } }>(
    '/refresh',
    {
      schema: {
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: { refreshToken: { type: 'string' } },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.body;
      const { jwt } = parseApiEnv(process.env);

      let payload: { sub: string };
      try {
        payload = verifyRefreshToken(refreshToken, jwt.refreshSecret);
      } catch {
        throw fastify.httpErrors.unauthorized('Invalid refresh token');
      }

      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, payload.sub),
      });
      if (!session) throw fastify.httpErrors.unauthorized('Invalid refresh token');
      if (session.revokedAt) throw fastify.httpErrors.unauthorized('Invalid refresh token');
      if (session.expiresAt < new Date()) throw fastify.httpErrors.unauthorized('Invalid refresh token');

      const user = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
      });
      if (!user) throw fastify.httpErrors.unauthorized('Invalid refresh token');

      await db.transaction(async (tx) => {
        await tx
          .update(sessions)
          .set({ revokedAt: new Date() })
          .where(eq(sessions.id, session.id));
      });

      const tokens = await issueTokenPair(user.id, user.email, jwt);
      return reply.send(tokens);
    },
  );
}
