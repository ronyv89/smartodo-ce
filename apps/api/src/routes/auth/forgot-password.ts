import type { FastifyInstance } from 'fastify';
import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { passwordResetTokens, users } from '@repo/db';
import { db } from '../../db.js';
import { sha256Hash } from '../../lib/crypto.js';

const ONE_HOUR_MS = 60 * 60 * 1_000;

export async function forgotPasswordRoute(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: { email: string } }>(
    '/forgot-password',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) return reply.send({ resetToken: null });

      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = sha256Hash(rawToken);
      const expiresAt = new Date(Date.now() + ONE_HOUR_MS);

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      return reply.send({ resetToken: rawToken });
    },
  );
}
