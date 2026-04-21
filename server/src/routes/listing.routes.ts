import express from 'express';
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  applyToListing,
  getRecommendations,
  getMyListings,
} from '../controllers/listing.controller';
import { protect, optionalProtect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', protect, createListing);
router.get('/', getListings);
router.get('/my', protect, getMyListings);
router.get('/recommendations', protect, getRecommendations);
router.get('/:id', optionalProtect, getListingById);
router.post('/:id/apply', protect, applyToListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

export default router;
