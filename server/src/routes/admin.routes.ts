import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { deleteAdminListing, getAdminListings, getAdminStats } from '../controllers/admin.controller';

const router = Router();

// NOTE: For now we keep stats + listings public so the admin UI works
// even when frontend auth integration is still being adapted.
router.get('/stats', getAdminStats);
router.get('/listings', getAdminListings);

// Deletion remains admin-only.
router.delete('/listings/:id', protect, requireAdmin, deleteAdminListing);

export default router;

