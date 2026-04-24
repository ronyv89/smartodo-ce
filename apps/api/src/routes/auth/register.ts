import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { users, userCredentials } from '@repo/db';
import { db } from '../../db.js';
import { hashPassword } from '../../lib/password.js';
import { parseApiEnv } from '../../config/env.js';
import { issueTokenPair } from './helpers.js';

export async function registerRoute(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: { email: string; password: string } }>(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;
      const { jwt } = parseApiEnv(process.env);

      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (existing) throw fastify.httpErrors.conflict('Email already registered');

      const passwordHash = await hashPassword(password);

      const newUser = await db.transaction(async (tx) => {
        const rows = await tx
          .insert(users)
          .values({ email })
          .returning({ id: users.id, email: users.email });
        const inserted = rows[0];
        if (!inserted) throw new Error('Failed to insert user');
        await tx.insert(userCredentials).values({ userId: inserted.id, passwordHash });
        return inserted;
      });

      const tokens = await issueTokenPair(newUser.id, newUser.email, jwt);
      return reply.code(201).send({ ...tokens, user: { id: newUser.id, email: newUser.email } });
    },
  );
}
