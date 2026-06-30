import { Router } from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import { requireAuth } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/errorHandler.js';
import { featureGate } from '../../middlewares/featureGate.js';
import { extractResumeSections, extractTextFromUpload } from '../../utils/documentParser.js';
import { ResumeService } from './resumes.service.js';

const router = Router();
const service = new ResumeService();
const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.mimetype);
    cb(ok ? null : new Error('Only PDF and DOCX resumes are supported'), ok);
  }
});

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    res.json({ resumes: await service.listMine(req.user) });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  featureGate('canSubmitResume'),
  [body('title').optional().trim().isLength({ min: 2 }), body('templateSlug').optional().trim()],
  validate,
  async (req, res, next) => {
    try {
      res.status(201).json({ resume: await service.create(req.user, req.body) });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/bulk-delete',
  featureGate('canDeleteResume'),
  [body('resumeIds').isArray({ min: 1 })],
  validate,
  async (req, res, next) => {
    try {
      res.json(await service.bulkDelete(req.user, req.body.resumeIds));
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/import',
  featureGate('canEditResume'),
  [param('id').isInt()],
  validate,
  importUpload.single('resume'),
  async (req, res, next) => {
    try {
      const resumeText = await extractTextFromUpload(req.file);
      const extracted = extractResumeSections(resumeText);
      const sections = await service.importExtractedData(req.user, req.params.id, extracted);
      res.json({ extracted, sections });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id/profile-image',
  featureGate('canUploadImage'),
  [param('id').isInt(), body('profileImageUrl').optional({ nullable: true }).isString()],
  validate,
  async (req, res, next) => {
    try {
      res.json({ resume: await service.update(req.user, req.params.id, { profileImageUrl: req.body.profileImageUrl || null }) });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id', [param('id').isInt()], validate, async (req, res, next) => {
  try {
    res.json(await service.get(req.user, req.params.id));
  } catch (error) {
    next(error);
  }
});

router.put(
  '/:id',
  featureGate('canEditResume'),
  [param('id').isInt()],
  validate,
  async (req, res, next) => {
    try {
      res.json({ resume: await service.update(req.user, req.params.id, req.body) });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', featureGate('canDeleteResume'), [param('id').isInt()], validate, async (req, res, next) => {
  try {
    await service.delete(req.user, req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.post(
  '/:resumeId/sections',
  featureGate('canEditResume'),
  [param('resumeId').isInt(), body('title').trim().isLength({ min: 2 })],
  validate,
  async (req, res, next) => {
    try {
      res.status(201).json({ section: await service.addSection(req.user, req.params.resumeId, req.body) });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:resumeId/sections/:sectionId',
  featureGate('canEditResume'),
  [param('resumeId').isInt(), param('sectionId').isInt()],
  validate,
  async (req, res, next) => {
    try {
      res.json({ section: await service.updateSection(req.user, req.params.resumeId, req.params.sectionId, req.body) });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:resumeId/sections/:sectionId',
  featureGate('canDeleteResume'),
  [param('resumeId').isInt(), param('sectionId').isInt()],
  validate,
  async (req, res, next) => {
    try {
      await service.deleteSection(req.user, req.params.resumeId, req.params.sectionId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:resumeId/sections/bulk-delete',
  featureGate('canDeleteResume'),
  [param('resumeId').isInt(), body('sectionIds').isArray()],
  validate,
  async (req, res, next) => {
    try {
      await service.bulkDeleteSections(req.user, req.params.resumeId, req.body.sectionIds);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
