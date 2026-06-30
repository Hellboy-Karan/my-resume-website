import { Router } from 'express';
import { body, param } from 'express-validator';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/errorHandler.js';
import { HttpError } from '../../common/httpError.js';
import { UserRepository } from '../users/users.repository.js';
import { ResumeRepository } from '../resumes/resumes.repository.js';
import { query } from '../../database/mysql.js';

const router = Router();
const users = new UserRepository();
const resumes = new ResumeRepository();

router.use(requireAuth, requireRole('ADMIN', 'SUB_ADMIN'));

router.get('/users', async (_req, res, next) => {
  try {
    res.json({ users: await users.list() });
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/users/:id/status',
  [param('id').isInt(), body('isActive').isBoolean()],
  validate,
  async (req, res, next) => {
    try {
      const target = await users.findById(req.params.id);
      if (!target) throw new HttpError(404, 'User not found');
      if (req.user.role === 'SUB_ADMIN' && target.role !== 'USER') throw new HttpError(403, 'Sub Admin can only manage users');
      res.json({ user: await users.update(req.params.id, { is_active: req.body.isActive }) });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/users/:id/features',
  [param('id').isInt(), body('featureFlags').isObject()],
  validate,
  async (req, res, next) => {
    try {
      const target = await users.findById(req.params.id);
      if (!target) throw new HttpError(404, 'User not found');
      if (req.user.role === 'SUB_ADMIN' && target.role !== 'USER') throw new HttpError(403, 'Sub Admin can only manage users');
      res.json({ user: await users.update(req.params.id, { featureFlags: req.body.featureFlags }) });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/resumes', async (_req, res, next) => {
  try {
    const allUsers = await users.list();
    const rows = [];
    for (const user of allUsers) {
      rows.push(...(await resumes.findByUser(user.id)).map((resume) => ({ ...resume, owner: user.username })));
    }
    res.json({ resumes: rows });
  } catch (error) {
    next(error);
  }
});

router.get('/templates', requireRole('ADMIN'), async (_req, res, next) => {
  try {
    res.json({ templates: await query('SELECT * FROM templates ORDER BY created_at DESC') });
  } catch (error) {
    next(error);
  }
});

router.post('/templates', requireRole('ADMIN'), [body('slug').trim().isLength({ min: 2 }), body('name').trim().isLength({ min: 2 })], validate, async (req, res, next) => {
  try {
    const result = await query(
      `INSERT INTO templates (slug, name, description, image_url, is_active)
       VALUES (:slug, :name, :description, :imageUrl, :isActive)
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), image_url = VALUES(image_url), is_active = VALUES(is_active)`,
      {
        slug: req.body.slug,
        name: req.body.name,
        description: req.body.description || '',
        imageUrl: req.body.imageUrl || null,
        isActive: req.body.isActive ?? true
      }
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    next(error);
  }
});

export default router;
