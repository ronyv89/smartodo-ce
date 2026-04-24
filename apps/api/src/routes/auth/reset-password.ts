import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { passwordResetTokens, userCredentials } from '@repo/db';
import { db } from '../../db.js';
import { sha256Hash } from '../../lib/crypto.js';
import { hashPassword } from '../../lib/password.js';

export async function resetPasswordRoute(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: { token: string; password: string } }>(
    '/reset-password',
    {
      schema: {
        body: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: { type: 'string', minLength: 1 },
            password: { type: 'string', minLength: 8 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const { token, password } = request.body;
      const tokenHash = sha256Hash(token);

      const resetToken = await db.query.passwordResetTokens.findFirst({
        where: eq(passwordResetTokens.tokenHash, tokenHash),
      });

      if (!resetToken) throw fastify.httpErrors.badRequest('Invalid or expired reset token');
      if (resetToken.usedAt) throw fastify.httpErrors.badRequest('Reset token already used');
      if (resetToken.expiresAt < new Date()) throw fastify.httpErrors.badRequest('Reset token expired');

      const passwordHash = await hashPassword(password);

      await db.transaction(async (tx) => {
        await tx
          .update(userCredentials)
          .set({ passwordHash, updatedAt: new Date() })
          .where(eq(userCredentials.userId, resetToken.userId));
        await tx
          .update(passwordResetTokens)
          .set({ usedAt: new Date() })
          .where(eq(passwordResetTokens.id, resetToken.id));
      });

      return reply.send({ message: 'Password reset successfully' });
    },
  );
}
