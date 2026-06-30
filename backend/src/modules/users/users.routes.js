import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { AuthService } from '../auth/auth.service.js';

const router = Router();
const authService = new AuthService();

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: authService.sanitizeUser(req.user) });
});

export default router;

