import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { strictRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/register', strictRateLimiter, AuthController.register);
router.post('/login', strictRateLimiter, AuthController.login);
router.get('/profile', authenticate, AuthController.getProfile);

export default router;
