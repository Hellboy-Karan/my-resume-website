import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../../middlewares/auth.js';
import { aiLimiter } from '../../middlewares/rateLimiter.js';
import { validate } from '../../middlewares/errorHandler.js';
import { featureGate } from '../../middlewares/featureGate.js';
import { AiService } from './ai.service.js';
import { AiSettingsRepository } from './ai.repository.js';

const router = Router();
const service = new AiService();
const repository = new AiSettingsRepository();

router.use(requireAuth);

router.post(
  '/improve',
  aiLimiter,
  featureGate('canUseAI'),
  [body('feature').trim().isLength({ min: 2 }), body('text').trim().isLength({ min: 5 })],
  validate,
  async (req, res, next) => {
    try {
      res.json({ suggestion: await service.improve({ userId: req.user.id, ...req.body }) });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/settings', async (req, res, next) => {
  try {
    res.json({ settings: await repository.findByUser(req.user.id) });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/settings',
  [
    body('provider').isIn(['OpenAI', 'OpenAI-compatible', 'openai', 'openai-compatible']),
    body('apiKey').isLength({ min: 8 }),
    body('baseUrl').isURL({ require_tld: false }),
    body('modelName').trim().isLength({ min: 2 })
  ],
  validate,
  async (req, res, next) => {
    try {
      res.json({ settings: await service.saveUserSettings(req.user.id, req.body) });
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/settings/enabled', [body('isEnabled').isBoolean()], validate, async (req, res, next) => {
  try {
    res.json({ settings: await repository.setEnabled(req.user.id, req.body.isEnabled) });
  } catch (error) {
    next(error);
  }
});

router.delete('/settings', async (req, res, next) => {
  try {
    await repository.remove(req.user.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;

