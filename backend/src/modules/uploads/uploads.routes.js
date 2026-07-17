import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../../middlewares/auth.js';
import { featureGate } from '../../middlewares/featureGate.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../common/httpError.js';
import { query } from '../../database/mysql.js';

const router = Router();
const uploadRoot = path.resolve(process.cwd(), env.uploadDir);
fs.mkdirSync(uploadRoot, { recursive: true });

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname).toLowerCase()}`)
});

const upload = multer({
  storage,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(allowed.has(file.mimetype) ? null : new HttpError(422, 'Unsupported file type'), allowed.has(file.mimetype))
});

router.post(
  '/',
  requireAuth,
  featureGate('canUploadImage'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      const type = req.body.fileType || (req.file.mimetype === 'application/pdf' ? 'RESUME_PDF' : 'PROJECT_IMAGE');
      const url = `/uploads/${req.file.filename}`;
      const result = await query(
        `INSERT INTO uploaded_files (user_id, resume_id, section_id, original_name, file_name, mime_type, size, url, file_type)
         VALUES (:userId, :resumeId, :sectionId, :originalName, :fileName, :mimeType, :size, :url, :fileType)`,
        {
          userId: req.user.id,
          resumeId: req.body.resumeId || null,
          sectionId: req.body.sectionId || null,
          originalName: req.file.originalname,
          fileName: req.file.filename,
          mimeType: req.file.mimetype,
          size: req.file.size,
          url,
          fileType: type
        }
      );
      res.status(201).json({ file: { id: result.insertId, url, type } });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

