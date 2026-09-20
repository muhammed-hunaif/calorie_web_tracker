import express from 'express';
import { addFoodEntry, getFoodEntries, updateFoodEntry, deleteFoodEntry } from '../controllers/foodEntryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, validateParams, validateQuery } from '../middleware/validationMiddleware.js';
import { foodEntrySchema, updateFoodEntrySchema } from '../schema/foodEntrySchema.js';
import { idParamSchema, paginationSchema } from '../schema/commonSchema.js';

const router = express.Router();

// Every route below is user-owned data: protect runs first, then validation.
router.get('/', protect, validateQuery(paginationSchema), getFoodEntries);
router.post('/add', protect, validate(foodEntrySchema), addFoodEntry);
router.put('/update/:id', protect, validateParams(idParamSchema), validate(updateFoodEntrySchema), updateFoodEntry);
router.delete('/delete/:id', protect, validateParams(idParamSchema), deleteFoodEntry);

export default router;
