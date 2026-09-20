import express from 'express';
import { getReports } from '../controllers/reportControllers.js';
import { getReportDetails } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateParams, validateQuery } from '../middleware/validationMiddleware.js';
import { dateParamSchema, reportQuerySchema } from '../schema/commonSchema.js';

const router = express.Router();

// Reports are computed for req.user.id only.
router.get('/', protect, validateQuery(reportQuerySchema), getReports);
router.get('/:date', protect, validateParams(dateParamSchema), getReportDetails);

export default router;
