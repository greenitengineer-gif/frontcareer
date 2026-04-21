import express from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favorite.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', protect, toggleFavorite);
router.get('/', protect, getFavorites);

export default router;
