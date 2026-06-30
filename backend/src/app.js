import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import resumeRoutes from './modules/resumes/resumes.routes.js';
import atsRoutes from './modules/ats/ats.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import uploadRoutes from './modules/uploads/uploads.routes.js';
import publicRoutes from './modules/public/public.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.frontendUrl, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.resolve(__dirname, '..', env.uploadDir)));
  app.use(apiLimiter);

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: env.appName });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/resumes', resumeRoutes);
  app.use('/api/ats', atsRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

