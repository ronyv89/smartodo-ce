import type { FastifyInstance } from 'fastify';
import { registerRoute } from './register.js';
import { loginRoute } from './login.js';
import { refreshRoute } from './refresh.js';
import { logoutRoute } from './logout.js';
import { meRoute } from './me.js';
import { forgotPasswordRoute } from './forgot-password.js';
import { resetPasswordRoute } from './reset-password.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.register(registerRoute);
  fastify.register(loginRoute);
  fastify.register(refreshRoute);
  fastify.register(forgotPasswordRoute);
  fastify.register(resetPasswordRoute);
  fastify.register(logoutRoute);
  fastify.register(meRoute);
}
