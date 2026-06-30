import express from 'express';
import { addExerciseEntry, getExerciseEntries, updateExerciseEntry, deleteExerciseEntry } from '../controllers/exerciseEntryController.js';
import { protect } from '../middleware/authmiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { exerciseEntrySchema, updateExerciseEntrySchema } from '../schema/exerciseEntrySchema.js';

const router = express.Router();

router.get('/', protect, getExerciseEntries);
router.post('/add', protect, validate(exerciseEntrySchema), addExerciseEntry);
router.put('/update/:id', protect, validate(updateExerciseEntrySchema), updateExerciseEntry);
router.delete('/delete/:id', protect, deleteExerciseEntry);

export default router;
