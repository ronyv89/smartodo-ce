import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth/index.js';
import { parseApiEnv, type ApiConfig } from './config/env.js';

export function buildApp(config?: ApiConfig): FastifyInstance {
  const resolvedConfig = config ?? parseApiEnv(process.env);
  const app = Fastify({ logger: false });

  void app.register(cors, { origin: resolvedConfig.corsOrigin });
  void app.register(sensible);
  void app.register(healthRoutes);
  void app.register(authRoutes, { prefix: '/auth' });

  return app;
}
