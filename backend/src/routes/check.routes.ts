import { Router } from 'express';
import { CheckController } from '../controllers/check.controller';
import { optionalAuth, authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/start', optionalAuth, CheckController.startCheck);
router.get('/:id/status', CheckController.getCheckStatus);
router.get('/:id/result', optionalAuth, CheckController.getCheckResult);
router.get('/my/history', authenticate, CheckController.getUserChecks);

export default router;
