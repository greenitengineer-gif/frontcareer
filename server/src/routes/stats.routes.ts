import { Router } from 'express';
import { getCandidateStats, getEmployerStats, getPublicStats, getCategoryStats } from '../controllers/stats.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/public', getPublicStats);
router.get('/categories', getCategoryStats);
router.get('/candidate', protect, getCandidateStats);
router.get('/employer', protect, getEmployerStats);

export default router;
