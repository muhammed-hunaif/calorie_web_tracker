import express from 'express';
import { addFoodEntry, getFoodEntries, updateFoodEntry, deleteFoodEntry } from '../controllers/foodEntryController.js';
import { protect } from '../middleware/authmiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { foodEntrySchema, updateFoodEntrySchema } from '../schema/foodEntrySchema.js';

const router = express.Router();

router.get('/', protect, getFoodEntries);
router.post('/add', protect, validate(foodEntrySchema), addFoodEntry);
router.put('/update/:id', protect, validate(updateFoodEntrySchema), updateFoodEntry);
router.delete('/delete/:id', protect, deleteFoodEntry);

export default router;
