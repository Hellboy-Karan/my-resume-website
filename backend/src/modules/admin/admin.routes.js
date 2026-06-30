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

router.get('/resume-users', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 8), 1), 50);
    const offset = (page - 1) * limit;
    const search = `%${String(req.query.search || '').trim()}%`;
    const role = req.query.role || 'all';
    const status = req.query.status || 'all';

    const filters = [];
    const having = [];
    const params = { search };
    if (req.query.search) filters.push('(u.name LIKE :search OR u.email LIKE :search OR u.username LIKE :search)');
    if (role !== 'all') {
      filters.push('u.role = :role');
      params.role = role;
    }
    if (status === 'published') having.push('SUM(CASE WHEN r.is_public = TRUE THEN 1 ELSE 0 END) > 0');
    if (status === 'draft') having.push('SUM(CASE WHEN r.is_public = FALSE THEN 1 ELSE 0 END) > 0');

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const havingClause = having.length ? `HAVING ${having.join(' AND ')}` : '';
    const rows = await query(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.username,
        u.role,
        u.created_at,
        MAX(r.updated_at) AS last_activity,
        COUNT(r.id) AS total_resumes,
        SUM(CASE WHEN r.is_public = TRUE THEN 1 ELSE 0 END) AS published_resumes,
        SUM(CASE WHEN r.is_public = FALSE THEN 1 ELSE 0 END) AS draft_resumes
       FROM users u
       JOIN resumes r ON r.user_id = u.id
       ${where}
       GROUP BY u.id, u.name, u.email, u.username, u.role, u.created_at
       ${havingClause}
       ORDER BY last_activity DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    const countRows = await query(
      `SELECT COUNT(*) AS total FROM (
        SELECT u.id
        FROM users u
        JOIN resumes r ON r.user_id = u.id
        ${where}
        GROUP BY u.id
        ${havingClause}
      ) grouped`,
      params
    );
    res.json({
      users: rows,
      pagination: {
        page,
        limit,
        total: countRows[0]?.total || 0,
        totalPages: Math.max(1, Math.ceil((countRows[0]?.total || 0) / limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users/:id/resumes', [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const target = await users.findById(req.params.id);
    if (!target) throw new HttpError(404, 'User not found');
    if (req.user.role === 'SUB_ADMIN' && target.role === 'ADMIN') throw new HttpError(403, 'Sub Admin cannot manage Admin resumes');
    res.json({ user: target, resumes: await resumes.findByUser(req.params.id) });
  } catch (error) {
    next(error);
  }
});

router.patch('/resumes/:id/visibility', [param('id').isInt(), body('isPublic').isBoolean()], validate, async (req, res, next) => {
  try {
    const resume = await resumes.findById(req.params.id);
    if (!resume) throw new HttpError(404, 'Resume not found');
    const owner = await users.findById(resume.user_id);
    if (req.user.role === 'SUB_ADMIN' && owner?.role === 'ADMIN') throw new HttpError(403, 'Sub Admin cannot change Admin resumes');
    res.json({ resume: await resumes.update(req.params.id, { isPublic: req.body.isPublic }) });
  } catch (error) {
    next(error);
  }
});

router.delete('/resumes/:id', [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const resume = await resumes.findById(req.params.id);
    if (!resume) throw new HttpError(404, 'Resume not found');
    const owner = await users.findById(resume.user_id);
    if (req.user.role === 'SUB_ADMIN') {
      if (owner?.role === 'ADMIN') throw new HttpError(403, 'Sub Admin cannot delete Admin resumes');
    }
    await resumes.delete(req.params.id);
    res.status(204).end();
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
