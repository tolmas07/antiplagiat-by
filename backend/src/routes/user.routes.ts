import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { UserModel } from '../models/user.model';
import { CheckResultModel } from '../models/checkResult.model';

const router = Router();

router.get('/stats', authenticate, async (req: any, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    const checks = await CheckResultModel.findByUserId(req.user.id, 100);

    res.json({
      success: true,
      data: {
        totalChecks: checks.length,
        checksToday: user?.checks_today || 0,
        isPremium: user?.is_premium || false,
        premiumExpiresAt: user?.premium_expires_at
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
