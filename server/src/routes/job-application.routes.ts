import express from 'express';
import { getJobApplications, updateApplicationStatus, getJobApplicationById, scheduleInterview } from '../controllers/job-application.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, getJobApplications);
router.get('/:id', protect, getJobApplicationById);
router.patch('/:id/status', protect, updateApplicationStatus);
router.post('/:id/schedule', protect, scheduleInterview);

export default router;
