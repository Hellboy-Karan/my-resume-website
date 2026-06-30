import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../../middlewares/auth.js';
import { AuthService } from '../auth/auth.service.js';
import { validate } from '../../middlewares/errorHandler.js';
import { UserRepository } from './users.repository.js';
import { sanitizeContent, sanitizeRichText } from '../../utils/richText.js';

const router = Router();
const authService = new AuthService();
const users = new UserRepository();

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: authService.sanitizeUser(req.user) });
});

router.get('/me/settings', requireAuth, async (req, res, next) => {
  try {
    const user = await users.findById(req.user.id);
    res.json({ user: authService.sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.put(
  '/me/settings',
  requireAuth,
  [
    body('name').optional().trim().isLength({ min: 2 }),
    body('profileImageUrl').optional({ nullable: true }).isString(),
    body('phone').optional({ nullable: true }).isString(),
    body('address').optional({ nullable: true }).isString(),
    body('city').optional({ nullable: true }).isString(),
    body('state').optional({ nullable: true }).isString(),
    body('country').optional({ nullable: true }).isString(),
    body('postalCode').optional({ nullable: true }).isString(),
    body('aboutMe').optional({ nullable: true }).isString(),
    body('shortDescription').optional({ nullable: true }).isString(),
    body('profileTitle').optional({ nullable: true }).isString(),
    body('themePreference').optional().isIn(['light', 'dark', 'system']),
    body('professionalInfo').optional().isObject(),
    body('certificates').optional().isArray(),
    body('socialLinks').optional().isArray({ max: 5 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const payload = {
        name: req.body.name,
        profile_image_url: req.body.profileImageUrl ?? req.body.profile_image_url,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        postal_code: req.body.postalCode,
        about_me: sanitizeRichText(req.body.aboutMe),
        short_description: sanitizeRichText(req.body.shortDescription),
        profile_title: req.body.profileTitle,
        theme_preference: req.body.themePreference,
        professional_info: sanitizeContent(req.body.professionalInfo),
        certificates: sanitizeContent(req.body.certificates),
        social_links: req.body.socialLinks
      };
      Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
      const user = await users.update(req.user.id, payload);
      res.json({ user: authService.sanitizeUser(user) });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
