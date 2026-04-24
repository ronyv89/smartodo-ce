import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { sessions } from '@repo/db';
import { db } from '../../db.js';
import { authenticate } from '../../plugins/authenticate.js';

export async function logoutRoute(fastify: FastifyInstance): Promise<void> {
  fastify.post('/logout', { preHandler: authenticate }, async (request, reply) => {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, request.user.sessionId));
    return reply.code(204).send();
  });
}
