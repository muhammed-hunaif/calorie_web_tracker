import express from 'express';
import { getReports } from '../controllers/reportControllers.js';
import { getReportDetails } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/', getReports);
router.get('/:date', getReportDetails);

export default router;
