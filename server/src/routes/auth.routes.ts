import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getMe, 
  getEmployers, 
  getEmployerById, 
  updateProfile, 
  updateAuthMetadata,
  followEmployer,
  unfollowEmployer
} from '../controllers/auth.controller';
import { protect, optionalProtect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/metadata', protect, updateAuthMetadata);
router.get('/employers', optionalProtect, getEmployers);
router.get('/employers/:id', optionalProtect, getEmployerById);
router.post('/employers/:id/follow', protect, followEmployer);
router.delete('/employers/:id/follow', protect, unfollowEmployer);

export default router;
