import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middlewares/errorHandler.js';
import { AuthService } from './auth.service.js';

const router = Router();
const authService = new AuthService();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('username').optional().trim().isLength({ min: 3 })
  ],
  validate,
  async (req, res, next) => {
    try {
      res.status(201).json(await authService.register(req.body));
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      res.json(await authService.login(req.body));
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/forgot-password/request',
  [body('email').isEmail()],
  validate,
  async (req, res, next) => {
    try {
      res.json(await authService.requestPasswordReset(req.body.email));
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/forgot-password/verify',
  [body('email').isEmail(), body('otp').trim().isLength({ min: 6, max: 6 })],
  validate,
  async (req, res, next) => {
    try {
      res.json(await authService.verifyPasswordResetOtp(req.body.email, req.body.otp));
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/forgot-password/reset',
  [
    body('email').isEmail(),
    body('otp').trim().isLength({ min: 6, max: 6 }),
    body('password').isLength({ min: 8 }),
    body('confirmPassword').isLength({ min: 8 })
  ],
  validate,
  async (req, res, next) => {
    try {
      res.json(await authService.resetPassword(req.body));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
