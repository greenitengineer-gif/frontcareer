import { Router } from 'express';
import { aiSearch, checkJobMatch } from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/search', aiSearch);
router.post('/check-match', protect, checkJobMatch);

export default router;
