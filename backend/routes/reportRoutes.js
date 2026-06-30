import express from 'express';
import { getReports } from '../controllers/reportControllers.js';
import { getReportDetails } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

router.get('/', protect, getReports);
router.get('/:date', protect, getReportDetails);

export default router;
