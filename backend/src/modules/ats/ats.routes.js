import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { optionalAuth, requireAuth } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/errorHandler.js';
import { featureGate } from '../../middlewares/featureGate.js';
import { extractTextFromUpload } from '../../utils/documentParser.js';
import { AtsService } from './ats.service.js';

const router = Router();
const ats = new AtsService();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.mimetype);
    cb(ok ? null : new Error('Only PDF and DOCX files are supported'), ok);
  }
});

router.post(
  '/analyze',
  optionalAuth,
  [body('resumeText').optional().isLength({ min: 20 }), body('jobDescription').optional()],
  validate,
  async (req, res, next) => {
    try {
      const report = ats.analyze(req.body.resumeText, req.body.jobDescription);
      if (req.user && req.body.resumeId) {
        return res.json({ report: await ats.saveReport({ userId: req.user.id, resumeId: req.body.resumeId, report }) });
      }
      return res.json({ report });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/analyze-file', optionalAuth, upload.single('resume'), async (req, res, next) => {
  try {
    const resumeText = await extractTextFromUpload(req.file);
    const report = ats.analyze(resumeText, req.body.jobDescription);
    res.json({ report, resumeText });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/save-report',
  requireAuth,
  featureGate('canUseATS'),
  [body('resumeId').isInt(), body('report').isObject()],
  validate,
  async (req, res, next) => {
    try {
      res.json({ report: await ats.saveReport({ userId: req.user.id, resumeId: req.body.resumeId, report: req.body.report }) });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
