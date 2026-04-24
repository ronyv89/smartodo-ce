import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../plugins/authenticate.js';

export async function meRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get('/me', { preHandler: authenticate }, async (request) => {
    return { id: request.user.id, email: request.user.email };
  });
}
