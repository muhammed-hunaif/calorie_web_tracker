import express from 'express';
import { addExerciseEntry, getExerciseEntries, updateExerciseEntry, deleteExerciseEntry } from '../controllers/exerciseEntryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, validateParams, validateQuery } from '../middleware/validationMiddleware.js';
import { exerciseEntrySchema, updateExerciseEntrySchema } from '../schema/exerciseEntrySchema.js';
import { idParamSchema, paginationSchema } from '../schema/commonSchema.js';

const router = express.Router();

// Every route below is user-owned data: protect runs first, then validation.
router.get('/', protect, validateQuery(paginationSchema), getExerciseEntries);
router.post('/add', protect, validate(exerciseEntrySchema), addExerciseEntry);
router.put('/update/:id', protect, validateParams(idParamSchema), validate(updateExerciseEntrySchema), updateExerciseEntry);
router.delete('/delete/:id', protect, validateParams(idParamSchema), deleteExerciseEntry);

export default router;
