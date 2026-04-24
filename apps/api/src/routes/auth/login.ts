import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { users, userCredentials } from '@repo/db';
import { db } from '../../db.js';
import { verifyPassword } from '../../lib/password.js';
import { parseApiEnv } from '../../config/env.js';
import { issueTokenPair } from './helpers.js';

export async function loginRoute(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: { email: string; password: string } }>(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 1 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;
      const { jwt } = parseApiEnv(process.env);

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (!user) throw fastify.httpErrors.unauthorized('Invalid credentials');

      const creds = await db.query.userCredentials.findFirst({
        where: eq(userCredentials.userId, user.id),
      });
      if (!creds) throw fastify.httpErrors.unauthorized('Invalid credentials');

      const valid = await verifyPassword(password, creds.passwordHash);
      if (!valid) throw fastify.httpErrors.unauthorized('Invalid credentials');

      const tokens = await issueTokenPair(user.id, user.email, jwt);
      return reply.send({ ...tokens, user: { id: user.id, email: user.email } });
    },
  );
}
