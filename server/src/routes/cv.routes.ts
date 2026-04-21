import express from 'express';
import { getMyCV, updateCV, getCV, getCVByUserId, getPublicCVs, getAllUserCVs, setPrimaryCV } from '../controllers/cv.controller';
import { protect, optionalProtect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, getAllUserCVs);
router.post('/set-primary', protect, setPrimaryCV);
router.get('/public', optionalProtect, getPublicCVs);
router.get('/my', protect, getMyCV);
router.post('/my', protect, updateCV);
router.get('/user/:userId', optionalProtect, getCVByUserId);
router.get('/:id', optionalProtect, getCV);

export default router;
